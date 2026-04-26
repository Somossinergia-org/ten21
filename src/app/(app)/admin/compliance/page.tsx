import { requireSuperAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as complianceService from "@/services/compliance.service";
import { AdminComplianceClient } from "./admin-compliance-client";

export default async function AdminCompliancePage() {
  await requireSuperAdmin();
  const deletions = await complianceService.listDeletionRequests();

  return (
    <div>
      <PageHeader title="Solicitudes de Compliance" />
      <AdminComplianceClient deletions={deletions} />
    </div>
  );
}
