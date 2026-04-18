import { requireRole, getTenantId } from "@/lib/tenant";
import * as receptionService from "@/services/reception.service";
import { NewReceptionForm } from "./new-reception-form";

export default async function NewReceptionPage() {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const eligibleOrders = await receptionService.getEligibleOrders(tenantId);

  if (eligibleOrders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva recepcion</h1>
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            No hay pedidos con estado &quot;Enviado&quot; o &quot;Parcial&quot; para recepcionar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nueva recepcion</h1>
      <p className="mt-1 text-sm text-gray-500">
        Registrar la recepcion de mercancia de un pedido
      </p>
      <NewReceptionForm orders={eligibleOrders} />
    </div>
  );
}
