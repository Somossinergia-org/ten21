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

export async function listDeliveries(tenantId: string, userId?: string) {
  return db.delivery.findMany({
    where: {
      tenantId,
      // REPARTO only sees their own deliveries (userId passed by action)
      ...(userId ? { assignedToId: userId } : {}),
    },
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
  return db.$transaction(async (tx) => {
    // Validate vehicle is not already in use
    const vehicle = await tx.vehicle.findFirst({
      where: { id: data.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new Error("Vehiculo no encontrado");
    }

    if (vehicle.status === "IN_USE") {
      throw new Error("Este vehiculo ya esta en uso");
    }

    if (vehicle.status === "INCIDENT" || vehicle.status === "WORKSHOP") {
      throw new Error("Este vehiculo no esta disponible (averiado o en taller)");
    }

    const deliveryNumber = await generateDeliveryNumber(tenantId);

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
  return db.$transaction(async (tx) => {
    const delivery = await tx.delivery.findFirst({
      where: { id, tenantId, status: "ASSIGNED" },
    });
    if (!delivery) throw new Error("Entrega no encontrada o no esta asignada");

    // Verify vehicle is still assigned to this delivery (not reassigned externally)
    if (delivery.vehicleId) {
      const vehicle = await tx.vehicle.findFirst({
        where: { id: delivery.vehicleId },
      });

      if (vehicle && vehicle.status !== "IN_USE") {
        // Vehicle was freed externally — re-claim it
        await tx.vehicle.update({
          where: { id: delivery.vehicleId },
          data: { status: "IN_USE" },
        });
      }
    }

    await tx.delivery.update({
      where: { id },
      data: {
        status: "IN_TRANSIT",
        startKm: startKm ?? null,
      },
    });
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

    if (delivery.vehicleId) {
      await tx.vehicle.update({
        where: { id: delivery.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }
  });
}
