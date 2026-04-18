"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { tenantConfigSchema, tenantBrandingSchema, toggleModuleSchema } from "@/lib/validations/tenant-config";
import * as configService from "@/services/tenant-config.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function saveTenantConfigAction(data: Record<string, unknown>): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = tenantConfigSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await configService.upsertConfig(tenantId, parsed.data);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "customer.updated", entity: "Customer",
      entityId: tenantId, details: { action: "tenant_config_saved" },
    });
    revalidatePath("/settings/tenant");
    return { success: true };
  } catch { return { success: false, error: "Error al guardar configuracion" }; }
}

export async function saveBrandingAction(data: Record<string, unknown>): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const parsed = tenantBrandingSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await configService.upsertBranding(tenantId, parsed.data);
    revalidatePath("/settings/branding");
    return { success: true };
  } catch { return { success: false, error: "Error al guardar branding" }; }
}

export async function toggleModuleAction(data: { moduleCode: string; enabled: boolean }): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const parsed = toggleModuleSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await configService.toggleModule(tenantId, parsed.data.moduleCode, parsed.data.enabled);
    revalidatePath("/settings/modules");
    return { success: true };
  } catch { return { success: false, error: "Error al cambiar modulo" }; }
}

export async function advanceOnboardingAction(step: number): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const statusMap: Record<number, string> = {
      0: "IN_PROGRESS", 1: "IN_PROGRESS", 2: "IN_PROGRESS",
      3: "CONFIGURED", 4: "SEEDED", 5: "READY", 6: "LIVE",
    };
    await configService.upsertOnboarding(tenantId, {
      currentStep: step,
      status: statusMap[step] || "IN_PROGRESS",
      ...(step >= 5 ? { activatedById: me.id } : {}),
      ...(step >= 6 ? { completedAt: new Date() } : {}),
    });
    revalidatePath("/onboarding");
    return { success: true };
  } catch { return { success: false, error: "Error al avanzar onboarding" }; }
}
