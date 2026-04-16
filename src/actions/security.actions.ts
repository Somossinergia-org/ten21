"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { enableMfaSchema, disableMfaSchema } from "@/lib/validations/security";
import * as securityService from "@/services/security.service";

type ActionResult = { success: boolean; error?: string; data?: unknown };

export async function initMfaAction(): Promise<ActionResult> {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const result = await securityService.initMfaSetup(me.id, tenantId);
    return { success: true, data: result };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function enableMfaAction(data: { code: string }): Promise<ActionResult> {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = enableMfaSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const result = await securityService.enableMfa(me.id, tenantId, parsed.data.code);
    await securityService.recordSecurityEvent({
      tenantId, userId: me.id, severity: "INFO", type: "MFA_ENABLED",
    });
    revalidatePath("/settings/security");
    return { success: true, data: result };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function disableMfaAction(data: { password: string; code: string }): Promise<ActionResult> {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = disableMfaSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await securityService.disableMfa(me.id, parsed.data.code);
    await securityService.recordSecurityEvent({
      tenantId, userId: me.id, severity: "WARNING", type: "MFA_DISABLED",
    });
    revalidatePath("/settings/security");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function unlockUserAction(userId: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const me = await getCurrentUser();

  try {
    await securityService.resetFailedLogins(userId);
    await securityService.recordSecurityEvent({
      userId: me.id, severity: "INFO", type: "ADMIN_ACCESS",
      payload: { action: "unlock_user", target: userId },
    });
    revalidatePath("/admin/security");
    return { success: true };
  } catch { return { success: false, error: "Error" }; }
}
