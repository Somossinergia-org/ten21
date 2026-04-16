import { requireRole, getTenantId } from "@/lib/tenant";
import * as deliveryService from "@/services/delivery.service";
import { DeliveryCalendar } from "./delivery-calendar";

export default async function CalendarPage() {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();
  const deliveries = await deliveryService.listDeliveries(tenantId);

  const events = deliveries.map((d) => ({
    id: d.id,
    title: `${d.deliveryNumber} — ${d.customerName}`,
    date: d.scheduledDate
      ? new Date(d.scheduledDate).toISOString().split("T")[0]
      : new Date(d.createdAt).toISOString().split("T")[0],
    color:
      d.status === "DELIVERED" ? "#16a34a" :
      d.status === "IN_TRANSIT" ? "#eab308" :
      d.status === "FAILED" ? "#dc2626" :
      d.status === "ASSIGNED" ? "#3b82f6" :
      "#9ca3af",
    url: `/vehicles/deliveries/${d.id}`,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Agenda de entregas</h1>
      <p className="mt-1 text-sm text-gray-500">Vista calendario de todas las entregas</p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <DeliveryCalendar events={events} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {[
          { color: "bg-blue-500", label: "Asignada" },
          { color: "bg-yellow-500", label: "En ruta" },
          { color: "bg-green-500", label: "Entregada" },
          { color: "bg-red-500", label: "Fallida" },
          { color: "bg-gray-400", label: "Pendiente" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            <span className="text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
