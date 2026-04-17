import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as salesService from "@/services/sales.service";
import { SalesViews } from "./sales-views";

export default async function SalesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const orders = await salesService.listSalesOrders(tenantId);

  return (
    <div>
      <PageHeader title="Ventas" />
      <SalesViews sales={orders} />
    </div>
  );
}
