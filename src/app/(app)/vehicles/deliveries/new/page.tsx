import { requireRole, getTenantId } from "@/lib/tenant";
import * as deliveryService from "@/services/delivery.service";
import { NewDeliveryForm } from "./new-delivery-form";

export default async function NewDeliveryPage() {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();

  const [vehicles, users] = await Promise.all([
    deliveryService.getAvailableVehicles(tenantId),
    deliveryService.getDeliveryUsers(tenantId),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nueva entrega</h1>
      <p className="mt-1 text-sm text-gray-500">Programar una entrega al cliente</p>
      <NewDeliveryForm vehicles={vehicles} users={users} />
    </div>
  );
}
