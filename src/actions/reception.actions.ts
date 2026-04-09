"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createReceptionSchema } from "@/lib/validations/reception";
import * as receptionService from "@/services/reception.service";

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

    revalidatePath("/reception");
    revalidatePath("/purchases");
    revalidatePath("/incidents");

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
