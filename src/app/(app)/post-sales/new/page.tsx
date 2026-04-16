import { requireRole, getTenantId } from "@/lib/tenant";
import * as customerService from "@/services/customer.service";
import { NewPostSaleForm } from "./new-postsale-form";

export default async function NewPostSalePage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const customers = await customerService.listCustomers(tenantId);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-200">Nuevo ticket posventa</h1>
      <p className="mt-1 text-sm text-slate-500">Registrar incidencia de cliente</p>
      <NewPostSaleForm customers={customers} />
    </div>
  );
}
