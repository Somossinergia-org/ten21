import Link from "next/link";
import { requireRole, getCurrentUser } from "@/lib/tenant";
import * as deliveryService from "@/services/delivery.service";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  ASSIGNED: { label: "Asignada", color: "bg-blue-100 text-blue-700" },
  IN_TRANSIT: { label: "En ruta", color: "bg-yellow-100 text-yellow-700" },
  DELIVERED: { label: "Entregada", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Fallida", color: "bg-red-100 text-red-700" },
};

export default async function DeliveriesPage() {
  const session = await requireRole(["JEFE", "REPARTO"]);
  const user = session.user;
  // REPARTO only sees their own deliveries, JEFE sees all
  const filterUserId = user.role === "REPARTO" ? user.id : undefined;
  const deliveries = await deliveryService.listDeliveries(user.tenantId, filterUserId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
          <p className="mt-1 text-sm text-gray-500">Entregas al cliente</p>
        </div>
        <Link
          href="/vehicles/deliveries/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva entrega
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Entrega</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Vehiculo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Repartidor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay entregas. Crea la primera.
                </td>
              </tr>
            ) : (
              deliveries.map((d) => {
                const status = statusLabels[d.status] || { label: d.status, color: "bg-gray-100" };
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{d.deliveryNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{d.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{d.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.vehicle?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.assignedTo?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.scheduledDate
                        ? new Date(d.scheduledDate).toLocaleDateString("es-ES")
                        : new Date(d.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/vehicles/deliveries/${d.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
