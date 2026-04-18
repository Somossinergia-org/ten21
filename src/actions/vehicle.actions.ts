"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import * as vehicleSyncService from "@/services/vehicle-sync.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

type SyncActionResult = {
  success: boolean;
  error?: string;
  total?: number;
  created?: number;
  updated?: number;
  skippedStatus?: number;
  errors?: string[];
};

export async function syncVehiclesAction(): Promise<SyncActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  try {
    const result = await vehicleSyncService.syncVehicles(tenantId);

    revalidatePath("/vehicles");

    return {
      success: true,
      total: result.total,
      created: result.created,
      updated: result.updated,
      skippedStatus: result.skippedStatus,
      errors: result.errors.length > 0 ? result.errors : undefined,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al sincronizar";
    return { success: false, error: msg };
  }
}

export async function createVehicleAction(data: {
  plate: string;
  name: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  if (!data.plate || !data.name) {
    return { success: false, error: "Matricula y nombre son obligatorios" };
  }

  try {
    const vehicle = await db.vehicle.create({
      data: {
        plate: data.plate.toUpperCase().trim(),
        name: data.name.trim(),
        tenantId,
      },
    });
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "vehicle.created", entity: "Vehicle",
      entityId: vehicle.id, entityRef: vehicle.plate,
      details: { name: vehicle.name },
    });
    revalidatePath("/vehicles");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { success: false, error: "Ya existe un vehiculo con esa matricula" };
    }
    return { success: false, error: "Error al crear el vehiculo" };
  }
}

export async function updateVehicleAction(data: {
  id: string;
  name?: string;
  plate?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const vehicle = await db.vehicle.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.plate && { plate: data.plate.toUpperCase().trim() }),
      },
    });
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "vehicle.updated", entity: "Vehicle",
      entityId: vehicle.id, entityRef: vehicle.plate,
    });
    revalidatePath("/vehicles");
    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el vehiculo" };
  }
}
