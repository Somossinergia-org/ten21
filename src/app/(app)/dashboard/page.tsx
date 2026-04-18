import { requireRole, getTenantId } from "@/lib/tenant";
import * as dashboardService from "@/services/dashboard.service";
import * as sparklineService from "@/services/sparkline.service";
import { HudDashboard } from "./hud-dashboard";

const incidentTypeLabels: Record<string, string> = { QUANTITY_MISMATCH: "Diferencia cantidad", DAMAGED: "Dañado", WRONG_PRODUCT: "Producto equivocado", OTHER: "Otro" };
const receptionLabels: Record<string, string> = { COMPLETED: "OK", WITH_INCIDENTS: "Incidencias", PENDING: "Pendiente", CHECKING: "Chequeo" };
const deliveryLabels: Record<string, string> = { ASSIGNED: "Asignada", IN_TRANSIT: "En ruta", DELIVERED: "Entregada", FAILED: "Fallida", PENDING: "Pendiente" };
const orderLabels: Record<string, string> = { DRAFT: "Borrador", SENT: "Enviado", PARTIAL: "Parcial", RECEIVED: "Recibido", CLOSED: "Cerrado" };
const incidentColors: Record<string, string> = { REGISTERED: "#eab308", NOTIFIED: "#3b82f6", REVIEWED: "#a855f7", CLOSED: "#22c55e" };
const orderColors: Record<string, string> = { DRAFT: "#64748b", SENT: "#3b82f6", PARTIAL: "#eab308", RECEIVED: "#22c55e", CLOSED: "#64748b" };
const receptionColors: Record<string, string> = { COMPLETED: "#22c55e", WITH_INCIDENTS: "#ef4444", PENDING: "#64748b", CHECKING: "#eab308" };

export default async function DashboardPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [kpis, alerts, todayOps, recent, incidentsByDay, deliveriesByDay] = await Promise.all([
    dashboardService.getKpis(tenantId), dashboardService.getAlerts(tenantId),
    dashboardService.getTodayOps(tenantId), dashboardService.getRecent(tenantId),
    sparklineService.getIncidentsByDay(tenantId), sparklineService.getDeliveriesByDay(tenantId),
  ]);

  const totalAlerts = alerts.openIncidents.length + alerts.failedDeliveries.length + alerts.incompleteOrders.length;

  const alertItems = [
    ...alerts.openIncidents.map((inc) => ({ id: inc.id, type: "incident", label: incidentTypeLabels[inc.type] || inc.type, sub: `${inc.reception.receptionNumber} / ${inc.reception.purchaseOrder.orderNumber}`, href: `/incidents/${inc.id}`, color: "#ef4444" })),
    ...alerts.failedDeliveries.map((d) => ({ id: d.id, type: "delivery", label: `${d.deliveryNumber} — ${d.customerName}`, sub: d.assignedTo?.name || "", href: `/vehicles/deliveries/${d.id}`, color: "#ef4444" })),
    ...alerts.incompleteOrders.map((o) => ({ id: o.id, type: "order", label: `${o.orderNumber} — ${o.supplier.name}`, sub: "Parcial", href: `/purchases/${o.id}`, color: "#f59e0b" })),
  ];

  return (
    <HudDashboard
      kpis={kpis}
      totalAlerts={totalAlerts}
      alerts={alertItems}
      todayReceptions={todayOps.todayReceptions.map((r) => ({ id: r.id, ref: r.receptionNumber, name: r.purchaseOrder.supplier.name, status: receptionLabels[r.status] || r.status, href: `/reception/${r.id}` }))}
      todayDeliveries={todayOps.todayDeliveries.map((d) => ({ id: d.id, ref: d.deliveryNumber, name: d.customerName, status: deliveryLabels[d.status] || d.status, href: `/vehicles/deliveries/${d.id}` }))}
      recentIncidents={recent.recentIncidents.map((i) => ({ id: i.id, label: incidentTypeLabels[i.type] || i.type, sub: i.reception.receptionNumber, href: `/incidents/${i.id}`, color: incidentColors[i.status] || "#64748b" }))}
      recentOrders={recent.recentOrders.map((o) => ({ id: o.id, label: `${o.orderNumber} ${o.supplier.name}`, sub: orderLabels[o.status] || o.status, href: `/purchases/${o.id}`, color: orderColors[o.status] || "#64748b" }))}
      recentReceptions={recent.recentReceptions.map((r) => ({ id: r.id, label: `${r.receptionNumber} ${r.purchaseOrder.orderNumber}`, sub: receptionLabels[r.status] || r.status, href: `/reception/${r.id}`, color: receptionColors[r.status] || "#64748b" }))}
      incidentsByDay={incidentsByDay}
      deliveriesByDay={deliveriesByDay}
    />
  );
}
