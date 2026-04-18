import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as configService from "@/services/tenant-config.service";
import { TenantConfigClient } from "./tenant-config-client";

export default async function TenantConfigPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const config = await configService.getConfig(tenantId);

  return (
    <div>
      <PageHeader title="Configuracion de tienda" />
      <TenantConfigClient config={config} />
    </div>
  );
}
