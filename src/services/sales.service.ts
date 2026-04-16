import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { CreateSalesOrderInput } from "@/lib/validations/sales";

async function generateOrderNumber(tenantId: string): Promise<string> {
  const last = await db.salesOrder.findFirst({
    where: { tenantId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  if (!last) return "VEN-001";
  const num = parseInt(last.orderNumber.replace("VEN-", ""), 10);
  return `VEN-${(num + 1).toString().padStart(3, "0")}`;
}

export async function listSalesOrders(tenantId: string) {
  return db.salesOrder.findMany({
    where: { tenantId },
    include: {
      customer: { select: { fullName: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSalesOrder(id: string, tenantId: string) {
  return db.salesOrder.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      createdBy: { select: { name: true } },
      lines: {
        include: { product: { select: { ref: true, name: true } } },
      },
      deliveries: {
        select: { id: true, deliveryNumber: true, status: true },
      },
      postSaleTickets: {
        select: { id: true, ticketNumber: true, status: true, type: true },
      },
    },
  });
}

export async function createSalesOrder(
  data: CreateSalesOrderInput,
  tenantId: string,
  createdById: string,
) {
  const orderNumber = await generateOrderNumber(tenantId);

  // Calculate totals
  let subtotal = 0;
  let estimatedMargin = 0;
  const lineData = data.lines.map((line) => {
    const lineTotal = line.quantity * line.unitSalePrice;
    subtotal += lineTotal;
    if (line.unitExpectedCost) {
      estimatedMargin += (line.unitSalePrice - line.unitExpectedCost) * line.quantity;
    }
    return {
      productId: line.productId || null,
      description: line.description,
      quantity: line.quantity,
      unitSalePrice: new Prisma.Decimal(line.unitSalePrice),
      unitExpectedCost: line.unitExpectedCost ? new Prisma.Decimal(line.unitExpectedCost) : null,
      lineTotal: new Prisma.Decimal(lineTotal),
      notes: line.notes || null,
      tenantId,
    };
  });

  const total = subtotal - (data.discountTotal || 0);

  return db.salesOrder.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      notes: data.notes || null,
      scheduledDeliveryDate: data.scheduledDeliveryDate ? new Date(data.scheduledDeliveryDate) : null,
      subtotal: new Prisma.Decimal(subtotal),
      discountTotal: new Prisma.Decimal(data.discountTotal || 0),
      total: new Prisma.Decimal(total),
      estimatedMargin: new Prisma.Decimal(estimatedMargin),
      createdById,
      tenantId,
      lines: { create: lineData },
    },
    include: { lines: true },
  });
}

export async function confirmSalesOrder(id: string, tenantId: string) {
  const order = await db.salesOrder.findFirst({
    where: { id, tenantId, status: "DRAFT" },
    include: { lines: true },
  });
  if (!order) throw new Error("Venta no encontrada o no esta en borrador");

  return db.$transaction(async (tx) => {
    // Try to reserve stock for each line with a product
    let allReserved = true;
    let anyReserved = false;

    for (const line of order.lines) {
      if (!line.productId) continue;

      const inv = await tx.productInventory.findFirst({
        where: { tenantId, productId: line.productId },
      });

      if (!inv) continue;

      const canReserve = Math.min(line.quantity, inv.available);
      if (canReserve > 0) {
        await tx.productInventory.update({
          where: { id: inv.id },
          data: {
            reserved: inv.reserved + canReserve,
            available: inv.available - canReserve,
          },
        });
        await tx.stockMovement.create({
          data: {
            tenantId, productId: line.productId,
            type: "SALE_RESERVE", quantity: canReserve,
            referenceType: "SalesOrder", referenceId: id,
          },
        });
        anyReserved = true;
      }
      if (canReserve < line.quantity) allReserved = false;
    }

    const newStatus = allReserved ? "RESERVED" : anyReserved ? "PARTIALLY_RESERVED" : "CONFIRMED";

    return tx.salesOrder.update({
      where: { id },
      data: { status: newStatus, confirmedAt: new Date() },
    });
  });
}

export async function cancelSalesOrder(id: string, tenantId: string) {
  const order = await db.salesOrder.findFirst({
    where: { id, tenantId, status: { in: ["DRAFT", "CONFIRMED", "PARTIALLY_RESERVED", "RESERVED"] } },
  });
  if (!order) throw new Error("Venta no encontrada o no se puede cancelar");

  return db.$transaction(async (tx) => {
    // Release any existing reservations
    const reserves = await tx.stockMovement.findMany({
      where: { tenantId, referenceType: "SalesOrder", referenceId: id, type: "SALE_RESERVE" },
    });

    // Calculate total reserved per product
    const reservedByProduct = new Map<string, number>();
    for (const r of reserves) {
      reservedByProduct.set(r.productId, (reservedByProduct.get(r.productId) || 0) + r.quantity);
    }

    // Check for already-released amounts
    const releases = await tx.stockMovement.findMany({
      where: { tenantId, referenceType: "SalesOrder", referenceId: id, type: "SALE_RELEASE" },
    });
    for (const r of releases) {
      const current = reservedByProduct.get(r.productId) || 0;
      reservedByProduct.set(r.productId, current - r.quantity);
    }

    // Release remaining
    for (const [productId, qty] of reservedByProduct) {
      if (qty <= 0) continue;
      const inv = await tx.productInventory.findFirst({
        where: { tenantId, productId },
      });
      if (inv) {
        await tx.productInventory.update({
          where: { id: inv.id },
          data: {
            reserved: Math.max(0, inv.reserved - qty),
            available: inv.available + qty,
          },
        });
      }
      await tx.stockMovement.create({
        data: {
          tenantId, productId, type: "SALE_RELEASE", quantity: qty,
          referenceType: "SalesOrder", referenceId: id,
        },
      });
    }

    return tx.salesOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  });
}
