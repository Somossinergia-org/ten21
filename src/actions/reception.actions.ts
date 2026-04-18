"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createReceptionSchema } from "@/lib/validations/reception";
import * as receptionService from "@/services/reception.service";
import * as activity from "@/services/activity.service";
import * as notifService from "@/services/notification.service";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createReceptionAction(data: {
  purchaseOrderId: string;
  deliveryNoteRef?: string;
  notes?: string;
  lines: {
    purchaseOrderLineId: string;
    quantityExpected: number;
    quantityReceived: number;
    quantityDamaged: number;
    notes?: string;
  }[];
}): Promise<ActionResult & { receptionId?: string; incidentsCreated?: number }> {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const user = await getCurrentUser();

  const parsed = createReceptionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await receptionService.createReception(
      parsed.data,
      tenantId,
      user.id,
    );

    await activity.log({
      tenantId, userId: user.id, userName: user.name,
      action: result.incidentsCreated > 0 ? "reception.created" : "reception.completed",
      entity: "Reception",
      entityId: result.reception.id,
      entityRef: result.reception.receptionNumber,
      details: {
        incidentsCreated: result.incidentsCreated,
        newPoStatus: result.newPoStatus,
      },
    });

    // Notify incidents created
    if (result.incidentsCreated > 0) {
      await notifService.notifyIncidentCreated(
        tenantId,
        `${result.incidentsCreated} incidencia(s) detectada(s)`,
        result.reception.receptionNumber,
        result.reception.id,
      );
    }

    // Notify partial order
    if (result.newPoStatus === "PARTIAL") {
      await notifService.notifyOrderPartial(
        tenantId, "", result.reception.purchaseOrderId,
      );
    }

    revalidatePath("/reception");
    revalidatePath("/purchases");
    revalidatePath("/incidents");
    revalidatePath("/notifications");

    return {
      success: true,
      receptionId: result.reception.id,
      incidentsCreated: result.incidentsCreated,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al crear la recepcion";
    return { success: false, error: msg };
  }
}
