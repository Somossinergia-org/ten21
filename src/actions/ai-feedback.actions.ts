"use server";

import { requireAuth, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as cognitive from "@/services/ai-cognitive.service";

type ActionResult = { success: boolean; error?: string };

export async function recordFeedbackAction(data: {
  agentCode: string;
  signalType: "USEFUL" | "NOT_USEFUL" | "INCORRECT" | "TOO_GENERIC" | "TOO_TECHNICAL" | "MISSED_RISK";
  conversationId?: string;
  messageId?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    await cognitive.recordFeedback(tenantId, data.agentCode, me.id, {
      signalType: data.signalType,
      conversationId: data.conversationId,
      messageId: data.messageId,
      notes: data.notes,
    });
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
