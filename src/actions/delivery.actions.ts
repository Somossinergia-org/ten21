"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId } from "@/lib/tenant";
import {
  createDeliverySchema,
  startDeliverySchema,
  completeDeliverySchema,
} from "@/lib/validations/delivery";
import * as deliveryService from "@/services/delivery.service";

type ActionResult = { success: boolean; error?: string };

export async function createDeliveryAction(data: {
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  description: string;
  scheduledDate?: string;
  vehicleId: string;
  assignedToId: string;
  notes?: string;
}): Promise<ActionResult & { deliveryId?: string }> {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();

  const parsed = createDeliverySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const delivery = await deliveryService.createDelivery(parsed.data, tenantId);
    revalidatePath("/vehicles");
    return { success: true, deliveryId: delivery.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear" };
  }
}

export async function startDeliveryAction(data: {
  deliveryId: string;
  startKm?: number;
}): Promise<ActionResult> {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();

  const parsed = startDeliverySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await deliveryService.startDelivery(parsed.data.deliveryId, tenantId, parsed.data.startKm);
    revalidatePath("/vehicles");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function completeDeliveryAction(data: {
  deliveryId: string;
  endKm?: number;
  failed: boolean;
}): Promise<ActionResult> {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();

  const parsed = completeDeliverySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await deliveryService.completeDelivery(
      parsed.data.deliveryId,
      tenantId,
      parsed.data.failed,
      parsed.data.endKm,
    );
    revalidatePath("/vehicles");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
