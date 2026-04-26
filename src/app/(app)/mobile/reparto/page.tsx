import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as deliveryService from "@/services/delivery.service";
import { MobileRepartoClient } from "./mobile-reparto-client";

export default async function MobileRepartoPage() {
  await requireRole(["REPARTO", "JEFE"]);
  const tenantId = await getTenantId();
  const user = await getCurrentUser();

  const deliveries = await deliveryService.listDeliveries(
    tenantId,
    user.role === "REPARTO" ? user.id : undefined,
  );

  const today = deliveries.filter((d) => {
    if (d.status === "DELIVERED" || d.status === "FAILED") return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Mis entregas" />
      <MobileRepartoClient deliveries={today} />
    </div>
  );
}
