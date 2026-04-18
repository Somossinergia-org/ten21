"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createProofSchema } from "@/lib/validations/proof";
import * as proofService from "@/services/proof.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function createProofAction(data: {
  deliveryId: string;
  type: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  fileDataUrl?: string;
  fileName?: string;
  requestId?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createProofSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const proof = await proofService.createProof(parsed.data, tenantId, me.id);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "delivery.completed", entity: "Delivery",
      entityId: data.deliveryId,
      details: { proofType: proof.type, proofId: proof.id },
    });
    revalidatePath(`/vehicles/deliveries/${data.deliveryId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
