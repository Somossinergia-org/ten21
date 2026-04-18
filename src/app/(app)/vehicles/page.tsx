import { requireRole, getTenantId } from "@/lib/tenant";
import { db } from "@/lib/db";
import { VehiclesClient } from "./vehicles-client";

export default async function VehiclesPage() {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();

  const vehicles = await db.vehicle.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vehiculos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Flota de vehiculos y estado en tiempo real
      </p>
      <VehiclesClient vehicles={vehicles} />
    </div>
  );
}
