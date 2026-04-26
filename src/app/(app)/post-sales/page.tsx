import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as postsaleService from "@/services/postsale.service";
import { PostSalesViews } from "./post-sales-views";

export default async function PostSalesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const tickets = await postsaleService.listTickets(tenantId);

  return (
    <div>
      <PageHeader title="Posventa" />
      <PostSalesViews tickets={tickets} />
    </div>
  );
}
