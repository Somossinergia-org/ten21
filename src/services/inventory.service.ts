import { db } from "@/lib/db";

export async function listInventory(tenantId: string) {
  return db.productInventory.findMany({
    where: { tenantId },
    include: {
      product: { select: { ref: true, name: true, category: true, brand: true, active: true } },
    },
    orderBy: { product: { ref: "asc" } },
  });
}

export async function getProductMovements(tenantId: string, productId: string, limit = 30) {
  return db.stockMovement.findMany({
    where: { tenantId, productId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function ensureInventory(tenantId: string, productId: string) {
  const existing = await db.productInventory.findFirst({
    where: { tenantId, productId },
  });
  if (existing) return existing;
  return db.productInventory.create({
    data: { tenantId, productId, onHand: 0, reserved: 0, available: 0 },
  });
}

export async function receptionIn(tenantId: string, productId: string, quantity: number, receptionId: string) {
  if (quantity <= 0) return;

  return db.$transaction(async (tx) => {
    let inv = await tx.productInventory.findFirst({ where: { tenantId, productId } });
    if (!inv) {
      inv = await tx.productInventory.create({
        data: { tenantId, productId, onHand: 0, reserved: 0, available: 0 },
      });
    }

    await tx.productInventory.update({
      where: { id: inv.id },
      data: {
        onHand: inv.onHand + quantity,
        available: inv.available + quantity,
      },
    });

    await tx.stockMovement.create({
      data: {
        tenantId, productId, type: "RECEPTION_IN", quantity,
        referenceType: "Reception", referenceId: receptionId,
      },
    });
  });
}

export async function deliveryOut(tenantId: string, productId: string, quantity: number, deliveryId: string) {
  if (quantity <= 0) return;

  return db.$transaction(async (tx) => {
    // Check for existing DELIVERY_OUT for this delivery+product to prevent duplicates
    const existing = await tx.stockMovement.findFirst({
      where: { tenantId, productId, type: "DELIVERY_OUT", referenceType: "Delivery", referenceId: deliveryId },
    });
    if (existing) return; // Already processed

    const inv = await tx.productInventory.findFirst({ where: { tenantId, productId } });
    if (!inv) return;

    await tx.productInventory.update({
      where: { id: inv.id },
      data: {
        onHand: Math.max(0, inv.onHand - quantity),
        reserved: Math.max(0, inv.reserved - quantity),
      },
    });

    await tx.stockMovement.create({
      data: {
        tenantId, productId, type: "DELIVERY_OUT", quantity,
        referenceType: "Delivery", referenceId: deliveryId,
      },
    });
  });
}

export async function manualAdjustment(
  tenantId: string,
  productId: string,
  quantity: number,
  notes: string,
  performedById: string,
) {
  return db.$transaction(async (tx) => {
    let inv = await tx.productInventory.findFirst({ where: { tenantId, productId } });
    if (!inv) {
      inv = await tx.productInventory.create({
        data: { tenantId, productId, onHand: 0, reserved: 0, available: 0 },
      });
    }

    const newOnHand = inv.onHand + quantity;
    const newAvailable = inv.available + quantity;

    if (newOnHand < 0) throw new Error("El ajuste dejaria stock fisico negativo");

    await tx.productInventory.update({
      where: { id: inv.id },
      data: {
        onHand: newOnHand,
        available: Math.max(0, newAvailable),
      },
    });

    await tx.stockMovement.create({
      data: {
        tenantId, productId, type: "MANUAL_ADJUSTMENT", quantity,
        notes, performedById,
        referenceType: "Manual", referenceId: null,
      },
    });

    return { newOnHand, newAvailable: Math.max(0, newAvailable) };
  });
}
