import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as complianceService from "@/services/compliance.service";
import { ComplianceClient } from "./compliance-client";

export default async function CompliancePage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [exports, deletions] = await Promise.all([
    complianceService.listExportRequests(tenantId),
    complianceService.listDeletionRequests(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Cumplimiento RGPD" />
      <ComplianceClient exports={exports} deletions={deletions} />
    </div>
  );
}
