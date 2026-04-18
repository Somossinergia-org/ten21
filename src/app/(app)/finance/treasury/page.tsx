import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as treasuryService from "@/services/treasury.service";
import { TreasuryClient } from "./treasury-client";

export default async function TreasuryPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [entries, forecast7, forecast30, forecast60, summary] = await Promise.all([
    treasuryService.listEntries(tenantId),
    treasuryService.getForecast(tenantId, 7),
    treasuryService.getForecast(tenantId, 30),
    treasuryService.getForecast(tenantId, 60),
    treasuryService.getSummary(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Tesoreria" />
      <TreasuryClient entries={entries} forecast7={forecast7} forecast30={forecast30} forecast60={forecast60} summary={summary} />
    </div>
  );
}
