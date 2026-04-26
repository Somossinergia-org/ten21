import { requireRole, getTenantId } from "@/lib/tenant";
import * as customerService from "@/services/customer.service";
import * as purchaseService from "@/services/purchase.service";
import { NewSalesOrderForm } from "./new-sales-form";

export default async function NewSalesOrderPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [customers, products] = await Promise.all([
    customerService.listCustomers(tenantId),
    purchaseService.listProducts(tenantId),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-200">Nueva venta</h1>
      <p className="mt-1 text-sm text-slate-500">Crear pedido de venta para un cliente</p>
      <NewSalesOrderForm customers={customers} products={products} />
    </div>
  );
}
