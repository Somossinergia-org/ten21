import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as aiService from "@/services/ai-agent.service";
import { getHandoffs, runInsightSweep } from "@/services/ai-insights.service";
import { AiCockpitClient } from "./ai-cockpit-client";

export default async function AiCockpitPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  await aiService.ensureAgentsSeeded();

  try {
    await runInsightSweep(tenantId);
  } catch (err) {
    console.error("[ai-cockpit] sweep failed", err);
  }

  const [insights, actions, handoffs, brief] = await Promise.all([
    aiService.getInsights(tenantId),
    aiService.getActionSuggestions(tenantId),
    getHandoffs(tenantId),
    aiService.getDailyBrief(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Cockpit IA" />
      <AiCockpitClient insights={insights} actions={actions} handoffs={handoffs} brief={brief} />
    </div>
  );
}
