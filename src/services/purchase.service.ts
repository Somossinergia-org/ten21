import { db } from "@/lib/db";
import type { CreatePurchaseOrderInput } from "@/lib/validations/purchase";
import type { CreateProductInput } from "@/lib/validations/product";
import type { CreateSupplierInput } from "@/lib/validations/supplier";
import type { PurchaseStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ============================================================
// ORDER NUMBER GENERATION
// ============================================================

async function generateOrderNumber(tenantId: string): Promise<string> {
  const lastOrder = await db.purchaseOrder.findFirst({
    where: { tenantId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "PED-001";
  }

  const lastNum = parseInt(lastOrder.orderNumber.replace("PED-", ""), 10);
  const nextNum = (lastNum + 1).toString().padStart(3, "0");
  return `PED-${nextNum}`;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function listProducts(tenantId: string) {
  return db.product.findMany({
    where: { tenantId, active: true },
    orderBy: { ref: "asc" },
  });
}

export async function createProduct(data: CreateProductInput, tenantId: string) {
  return db.product.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

// ============================================================
// SUPPLIERS
// ============================================================

export async function listSuppliers(tenantId: string) {
  return db.supplier.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(data: CreateSupplierInput, tenantId: string) {
  return db.supplier.create({
    data: {
      name: data.name,
      code: data.code,
      phone: data.phone || null,
      email: data.email || null,
      tenantId,
    },
  });
}

// ============================================================
// PURCHASE ORDERS
// ============================================================

export async function listPurchaseOrders(tenantId: string) {
  return db.purchaseOrder.findMany({
    where: { tenantId },
    include: {
      supplier: { select: { name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseOrder(id: string, tenantId: string) {
  return db.purchaseOrder.findFirst({
    where: { id, tenantId },
    include: {
      supplier: true,
      createdBy: { select: { name: true } },
      lines: {
        include: {
          product: { select: { ref: true, name: true } },
        },
      },
    },
  });
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderInput,
  tenantId: string,
  createdById: string,
) {
  const orderNumber = await generateOrderNumber(tenantId);

  return db.purchaseOrder.create({
    data: {
      orderNumber,
      type: data.type,
      supplierId: data.supplierId,
      notes: data.notes || null,
      tenantId,
      createdById,
      lines: {
        create: data.lines.map((line) => ({
          productId: line.productId,
          quantityOrdered: line.quantityOrdered,
          expectedUnitCost: line.expectedUnitCost
            ? new Prisma.Decimal(line.expectedUnitCost)
            : null,
        })),
      },
    },
    include: {
      lines: {
        include: {
          product: { select: { ref: true, name: true } },
        },
      },
    },
  });
}

export async function updatePurchaseOrderStatus(
  id: string,
  tenantId: string,
  status: PurchaseStatus,
) {
  return db.purchaseOrder.update({
    where: { id },
    data: { status },
  });
}
