import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as postsaleService from "@/services/postsale.service";
import { PostSalesClient } from "./post-sales-client";

export default async function PostSalesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const tickets = await postsaleService.listTickets(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Posventa" />
        <Link href="/post-sales/new" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition-colors">
          Nuevo ticket
        </Link>
      </div>
      <PostSalesClient tickets={tickets} />
    </div>
  );
}
