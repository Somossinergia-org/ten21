import { requireRole, getTenantId } from "@/lib/tenant";
import * as purchaseService from "@/services/purchase.service";
import { SuppliersClient } from "./suppliers-client";

export default async function SuppliersPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const suppliers = await purchaseService.listSuppliers(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
      <p className="mt-1 text-sm text-gray-500">
        Proveedores registrados para pedidos
      </p>
      <SuppliersClient suppliers={suppliers} />
    </div>
  );
}
