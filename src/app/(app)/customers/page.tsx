import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as customerService from "@/services/customer.service";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const customers = await customerService.getAllCustomers(tenantId);

  return (
    <div>
      <PageHeader title="Clientes" />
      <CustomersClient customers={customers} />
    </div>
  );
}
