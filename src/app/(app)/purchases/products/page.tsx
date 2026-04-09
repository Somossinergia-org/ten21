import { requireRole, getTenantId } from "@/lib/tenant";
import * as purchaseService from "@/services/purchase.service";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const products = await purchaseService.listProducts(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Catalogo de productos para pedidos a proveedores
      </p>
      <ProductsClient products={products} />
    </div>
  );
}
