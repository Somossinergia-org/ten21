"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as vehicleSyncService from "@/services/vehicle-sync.service";

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
