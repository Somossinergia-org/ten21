"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { dataExportRequestSchema, dataDeletionRequestSchema, approveDeletionSchema } from "@/lib/validations/compliance";
import * as complianceService from "@/services/compliance.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function requestDataExportAction(data: { type: string; reason?: string }): Promise<ActionResult & { requestId?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = dataExportRequestSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const req = await complianceService.createExportRequest(tenantId, me.id, parsed.data.type, parsed.data.reason);
    // Process immediately (synchronous for now)
    await complianceService.processExport(req.id);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "customer.updated", entity: "Customer",
      entityId: tenantId, details: { action: "export_requested", type: parsed.data.type },
    });
    revalidatePath("/settings/compliance");
    return { success: true, requestId: req.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function requestDataDeletionAction(data: {
  type: string; targetEntityType?: string; targetEntityId?: string; reason: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = dataDeletionRequestSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await complianceService.createDeletionRequest(tenantId, me.id, parsed.data);
    revalidatePath("/settings/compliance");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function approveDeletionAction(data: { requestId: string; approved: boolean }): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const me = await getCurrentUser();

  const parsed = approveDeletionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await complianceService.processDeletion(parsed.data.requestId, me.id, parsed.data.approved);
    revalidatePath("/admin/compliance");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
