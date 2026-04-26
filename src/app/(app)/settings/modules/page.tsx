import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as configService from "@/services/tenant-config.service";
import { ModulesClient } from "./modules-client";

export default async function ModulesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const modules = await configService.listModules(tenantId);

  return (
    <div>
      <PageHeader title="Modulos activos" />
      <ModulesClient modules={modules} allModules={configService.ALL_MODULES} />
    </div>
  );
}
