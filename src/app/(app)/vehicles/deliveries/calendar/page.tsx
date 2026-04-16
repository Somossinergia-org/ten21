import { requireRole, getCurrentUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import { DeliveryCalendar } from "./delivery-calendar";

export default async function CalendarPage() {
  const session = await requireRole(["JEFE", "REPARTO"]);
  const user = session.user;
  const filterUserId = user.role === "REPARTO" ? user.id : undefined;

  const deliveries = await db.delivery.findMany({
    where: {
      tenantId: user.tenantId,
      ...(filterUserId ? { assignedToId: filterUserId } : {}),
    },
    include: {
      vehicle: { select: { name: true, plate: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const events = deliveries.map((d) => {
    const dateStr = d.scheduledDate
      ? new Date(d.scheduledDate).toISOString().split("T")[0]
      : new Date(d.createdAt).toISOString().split("T")[0];

    const statusConfig: Record<string, { color: string; label: string }> = {
      DELIVERED: { color: "#16a34a", label: "Entregada" },
      IN_TRANSIT: { color: "#eab308", label: "En ruta" },
      FAILED: { color: "#dc2626", label: "Fallida" },
      ASSIGNED: { color: "#3b82f6", label: "Asignada" },
      PENDING: { color: "#9ca3af", label: "Pendiente" },
    };
    const cfg = statusConfig[d.status] || statusConfig.PENDING;

    return {
      id: d.id,
      title: `${d.deliveryNumber} — ${d.customerName}`,
      date: dateStr,
      color: cfg.color,
      url: `/vehicles/deliveries/${d.id}`,
      extendedProps: {
        deliveryNumber: d.deliveryNumber,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        customerAddress: d.customerAddress,
        description: d.description,
        status: d.status,
        statusLabel: cfg.label,
        vehicleName: d.vehicle?.name || "Sin asignar",
        vehiclePlate: d.vehicle?.plate || "",
        assignedTo: d.assignedTo?.name || "Sin asignar",
        startKm: d.startKm,
        endKm: d.endKm,
      },
    };
  });

  // Summary stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "PENDING").length,
    assigned: deliveries.filter((d) => d.status === "ASSIGNED").length,
    inTransit: deliveries.filter((d) => d.status === "IN_TRANSIT").length,
    delivered: deliveries.filter((d) => d.status === "DELIVERED").length,
    failed: deliveries.filter((d) => d.status === "FAILED").length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Agenda de entregas</h1>
      <p className="mt-1 text-sm text-gray-500">Calendario completo con todas las entregas</p>

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "Total", value: stats.total, color: "bg-gray-900 text-white" },
          { label: "Pendientes", value: stats.pending, color: "bg-gray-100 text-gray-700" },
          { label: "Asignadas", value: stats.assigned, color: "bg-blue-100 text-blue-700" },
          { label: "En ruta", value: stats.inTransit, color: "bg-yellow-100 text-yellow-700" },
          { label: "Entregadas", value: stats.delivered, color: "bg-green-100 text-green-700" },
          { label: "Fallidas", value: stats.failed, color: "bg-red-100 text-red-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.color} px-3 py-2 text-center`}>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <DeliveryCalendar events={events} />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs px-1">
        {[
          { color: "bg-blue-500", label: "Asignada" },
          { color: "bg-yellow-500", label: "En ruta" },
          { color: "bg-green-500", label: "Entregada" },
          { color: "bg-red-500", label: "Fallida" },
          { color: "bg-gray-400", label: "Pendiente" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${l.color}`} />
            <span className="text-gray-600 font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
