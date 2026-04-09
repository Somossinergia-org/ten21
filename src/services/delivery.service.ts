import { db } from "@/lib/db";
import type { CreateDeliveryInput } from "@/lib/validations/delivery";

// ============================================================
// NUMBER GENERATION
// ============================================================

async function generateDeliveryNumber(tenantId: string): Promise<string> {
  const last = await db.delivery.findFirst({
    where: { tenantId },
    orderBy: { deliveryNumber: "desc" },
    select: { deliveryNumber: true },
  });
  if (!last) return "ENT-001";
  const num = parseInt(last.deliveryNumber.replace("ENT-", ""), 10);
  return `ENT-${(num + 1).toString().padStart(3, "0")}`;
}

// ============================================================
// QUERIES
// ============================================================

export async function listDeliveries(tenantId: string) {
  return db.delivery.findMany({
    where: { tenantId },
    include: {
      vehicle: { select: { name: true, plate: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDelivery(id: string, tenantId: string) {
  return db.delivery.findFirst({
    where: { id, tenantId },
    include: {
      vehicle: { select: { id: true, name: true, plate: true } },
      assignedTo: { select: { name: true } },
    },
  });
}

export async function getAvailableVehicles(tenantId: string) {
  return db.vehicle.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function getDeliveryUsers(tenantId: string) {
  return db.user.findMany({
    where: { tenantId, role: "REPARTO", active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

// ============================================================
// CREATE
// ============================================================

export async function createDelivery(
  data: CreateDeliveryInput,
  tenantId: string,
) {
  const deliveryNumber = await generateDeliveryNumber(tenantId);

  return db.$transaction(async (tx) => {
    const delivery = await tx.delivery.create({
      data: {
        deliveryNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        customerAddress: data.customerAddress,
        description: data.description,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        vehicleId: data.vehicleId,
        assignedToId: data.assignedToId,
        notes: data.notes || null,
        status: "ASSIGNED",
        tenantId,
      },
    });

    // Vehicle is now assigned
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "IN_USE" },
    });

    return delivery;
  });
}

// ============================================================
// STATE TRANSITIONS
// ============================================================

export async function startDelivery(
  id: string,
  tenantId: string,
  startKm?: number,
) {
  const delivery = await db.delivery.findFirst({
    where: { id, tenantId, status: "ASSIGNED" },
  });
  if (!delivery) throw new Error("Entrega no encontrada o no esta asignada");

  return db.$transaction(async (tx) => {
    await tx.delivery.update({
      where: { id },
      data: {
        status: "IN_TRANSIT",
        startKm: startKm ?? null,
      },
    });

    if (delivery.vehicleId) {
      await tx.vehicle.update({
        where: { id: delivery.vehicleId },
        data: { status: "IN_USE" },
      });
    }
  });
}

export async function completeDelivery(
  id: string,
  tenantId: string,
  failed: boolean,
  endKm?: number,
) {
  const delivery = await db.delivery.findFirst({
    where: { id, tenantId, status: "IN_TRANSIT" },
  });
  if (!delivery) throw new Error("Entrega no encontrada o no esta en ruta");

  return db.$transaction(async (tx) => {
    await tx.delivery.update({
      where: { id },
      data: {
        status: failed ? "FAILED" : "DELIVERED",
        deliveredAt: new Date(),
        endKm: endKm ?? null,
      },
    });

    // Vehicle becomes available again
    if (delivery.vehicleId) {
      await tx.vehicle.update({
        where: { id: delivery.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }
  });
}
