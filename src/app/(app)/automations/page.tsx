import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as automationService from "@/services/automation.service";
import * as outboundService from "@/services/outbound.service";
import { AutomationsClient } from "./automations-client";

export default async function AutomationsPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [rules, templates, messages] = await Promise.all([
    automationService.listRules(tenantId),
    automationService.listTemplates(tenantId),
    outboundService.listMessages(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Automatizaciones" />
      <AutomationsClient rules={rules} templates={templates} messages={messages} />
    </div>
  );
}
