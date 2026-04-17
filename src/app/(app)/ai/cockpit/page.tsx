import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as aiService from "@/services/ai-agent.service";
import { AiCockpitClient } from "./ai-cockpit-client";

export default async function AiCockpitPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  await aiService.ensureAgentsSeeded();

  const [insights, actions, brief] = await Promise.all([
    aiService.getInsights(tenantId),
    aiService.getActionSuggestions(tenantId),
    aiService.getDailyBrief(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Cockpit IA" />
      <AiCockpitClient insights={insights} actions={actions} brief={brief} />
    </div>
  );
}
