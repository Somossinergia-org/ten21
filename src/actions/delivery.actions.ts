"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import {
  createDeliverySchema,
  startDeliverySchema,
  completeDeliverySchema,
} from "@/lib/validations/delivery";
import * as deliveryService from "@/services/delivery.service";
import * as activity from "@/services/activity.service";
import * as notifService from "@/services/notification.service";

type ActionResult = { success: boolean; error?: string };

export async function createDeliveryAction(data: {
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  description: string;
  scheduledDate?: string;
  vehicleId: string;
  assignedToId: string;
  notes?: string;
  lines?: { productId?: string; description: string; quantity: number; notes?: string }[];
}): Promise<ActionResult & { deliveryId?: string }> {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();
  const user = await getCurrentUser();

  const parsed = createDeliverySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const delivery = await deliveryService.createDelivery(parsed.data, tenantId);
    await activity.log({
      tenantId, userId: user.id, userName: user.name,
      action: "delivery.created", entity: "Delivery",
      entityId: delivery.id, entityRef: delivery.deliveryNumber,
      details: { customer: parsed.data.customerName },
    });
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
  const user = await getCurrentUser();

  const parsed = startDeliverySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await deliveryService.startDelivery(parsed.data.deliveryId, tenantId, parsed.data.startKm);
    await activity.log({
      tenantId, userId: user.id, userName: user.name,
      action: "delivery.started", entity: "Delivery",
      entityId: parsed.data.deliveryId,
      details: parsed.data.startKm ? { startKm: parsed.data.startKm } : undefined,
    });
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
  const user = await getCurrentUser();

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
    await activity.log({
      tenantId, userId: user.id, userName: user.name,
      action: parsed.data.failed ? "delivery.failed" : "delivery.completed",
      entity: "Delivery",
      entityId: parsed.data.deliveryId,
      details: parsed.data.endKm ? { endKm: parsed.data.endKm } : undefined,
    });

    // Notify on failure
    if (parsed.data.failed) {
      const delivery = await deliveryService.getDelivery(parsed.data.deliveryId, tenantId);
      if (delivery) {
        await notifService.notifyDeliveryFailed(
          tenantId, delivery.deliveryNumber, delivery.customerName,
          delivery.notes, delivery.id,
        );
      }
    }

    revalidatePath("/vehicles");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
