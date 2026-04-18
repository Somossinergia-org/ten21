import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as missionService from "@/services/mission.service";
import { MissionsClient } from "./missions-client";

export default async function MissionsPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const missions = await missionService.listMissions(tenantId);

  return (
    <div>
      <PageHeader title="Misiones autonomas" />
      <MissionsClient missions={missions} />
    </div>
  );
}
