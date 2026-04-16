"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createAutomationRuleSchema, createTemplateSchema } from "@/lib/validations/automation";
import * as automationService from "@/services/automation.service";
import * as outboundService from "@/services/outbound.service";

type ActionResult = { success: boolean; error?: string };

export async function createAutomationRuleAction(data: {
  code: string; eventType: string; channel: string; target: string;
  templateId?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createAutomationRuleSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await automationService.createRule(tenantId, { ...parsed.data, createdById: me.id });
    revalidatePath("/automations");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique")) return { success: false, error: "Ya existe una regla con ese codigo" };
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function toggleAutomationRuleAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await automationService.toggleRule(id, tenantId);
    revalidatePath("/automations");
    return { success: true };
  } catch { return { success: false, error: "Error" }; }
}

export async function createTemplateAction(data: {
  code: string; channel: string; eventType: string; subject?: string; body: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const parsed = createTemplateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await automationService.createTemplate(tenantId, parsed.data);
    revalidatePath("/automations");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique")) return { success: false, error: "Ya existe una plantilla con ese codigo" };
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function retryOutboundAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await outboundService.retryMessage(id, tenantId);
    revalidatePath("/automations");
    return { success: true };
  } catch (e: unknown) { return { success: false, error: e instanceof Error ? e.message : "Error" }; }
}

export async function cancelOutboundAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await outboundService.cancelMessage(id, tenantId);
    revalidatePath("/automations");
    return { success: true };
  } catch { return { success: false, error: "Error" }; }
}

export async function processQueueAction(): Promise<ActionResult & { processed?: number }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const results = await outboundService.processQueue(tenantId);
    revalidatePath("/automations");
    return { success: true, processed: results.length };
  } catch { return { success: false, error: "Error al procesar cola" }; }
}
