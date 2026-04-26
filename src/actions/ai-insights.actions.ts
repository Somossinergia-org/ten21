"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId } from "@/lib/tenant";
import { db } from "@/lib/db";
import { runInsightSweep } from "@/services/ai-insights.service";
import { ensureAgentsSeeded } from "@/services/ai-agent.service";

type ActionResult<T = unknown> = { success: boolean; error?: string; data?: T };

export async function triggerInsightSweep(): Promise<ActionResult<{ processed: number }>> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await ensureAgentsSeeded();
    const result = await runInsightSweep(tenantId);
    revalidatePath("/ai/cockpit");
    return { success: true, data: { processed: result.processed } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error en sweep" };
  }
}

export async function acknowledgeInsight(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const ins = await db.aiInsight.findFirst({ where: { id, tenantId } });
    if (!ins) return { success: false, error: "Insight no encontrado" };
    await db.aiInsight.update({ where: { id }, data: { status: "ACKNOWLEDGED" } });
    revalidatePath("/ai/cockpit");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function dismissInsight(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const ins = await db.aiInsight.findFirst({ where: { id, tenantId } });
    if (!ins) return { success: false, error: "Insight no encontrado" };
    await db.aiInsight.update({ where: { id }, data: { status: "DISMISSED" } });
    revalidatePath("/ai/cockpit");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function acceptAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const act = await db.aiActionSuggestion.findFirst({ where: { id, tenantId } });
    if (!act) return { success: false, error: "Acción no encontrada" };
    await db.aiActionSuggestion.update({ where: { id }, data: { status: "ACCEPTED" } });
    revalidatePath("/ai/cockpit");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function rejectAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const act = await db.aiActionSuggestion.findFirst({ where: { id, tenantId } });
    if (!act) return { success: false, error: "Acción no encontrada" };
    await db.aiActionSuggestion.update({ where: { id }, data: { status: "REJECTED" } });
    revalidatePath("/ai/cockpit");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function markHandoffAccepted(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    const ho = await db.aiHandoff.findFirst({ where: { id, tenantId } });
    if (!ho) return { success: false, error: "Handoff no encontrado" };
    await db.aiHandoff.update({ where: { id }, data: { status: "HANDOFF_ACCEPTED" } });
    revalidatePath("/ai/cockpit");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
