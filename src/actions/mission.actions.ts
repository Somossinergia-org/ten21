"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as missionService from "@/services/mission.service";

type ActionResult = { success: boolean; error?: string; missionId?: string };

export async function createMissionAction(orderText: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  if (!orderText || orderText.trim().length < 5) {
    return { success: false, error: "La orden debe tener al menos 5 caracteres" };
  }

  try {
    const mission = await missionService.createMission(tenantId, orderText.trim(), me.id);
    revalidatePath("/ai/missions");
    return { success: true, missionId: mission.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear mision" };
  }
}

export async function executeMissionAction(missionId: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  try {
    await missionService.executeMission(tenantId, missionId);
    revalidatePath("/ai/missions");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al ejecutar" };
  }
}

export async function confirmStepAction(stepId: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    await missionService.confirmStep(tenantId, stepId, me.id);
    revalidatePath("/ai/missions");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
