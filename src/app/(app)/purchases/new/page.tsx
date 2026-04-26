import { requireRole, getTenantId } from "@/lib/tenant";
import * as purchaseService from "@/services/purchase.service";
import { NewPurchaseForm } from "./new-purchase-form";

export default async function NewPurchasePage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [suppliers, products] = await Promise.all([
    purchaseService.listSuppliers(tenantId),
    purchaseService.listProducts(tenantId),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nuevo pedido</h1>
      <p className="mt-1 text-sm text-gray-500">
        Crear un pedido a proveedor
      </p>
      <NewPurchaseForm suppliers={suppliers} products={products} />
    </div>
  );
}
