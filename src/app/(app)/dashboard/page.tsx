import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as dashboardService from "@/services/dashboard.service";

// ============================================================
// STATUS CONFIGS
// ============================================================

const incidentTypeLabels: Record<string, string> = {
  QUANTITY_MISMATCH: "Diferencia cantidad",
  DAMAGED: "Dañado",
  WRONG_PRODUCT: "Producto equivocado",
  OTHER: "Otro",
};

const receptionStatusConfig: Record<string, { label: string; dot: string }> = {
  COMPLETED: { label: "OK", dot: "bg-green-500" },
  WITH_INCIDENTS: { label: "Con incidencias", dot: "bg-red-500" },
  PENDING: { label: "Pendiente", dot: "bg-gray-400" },
  CHECKING: { label: "En chequeo", dot: "bg-yellow-500" },
};

const deliveryStatusConfig: Record<string, { label: string; dot: string }> = {
  ASSIGNED: { label: "Asignada", dot: "bg-blue-500" },
  IN_TRANSIT: { label: "En ruta", dot: "bg-yellow-500" },
  DELIVERED: { label: "Entregada", dot: "bg-green-500" },
  FAILED: { label: "Fallida", dot: "bg-red-500" },
  PENDING: { label: "Pendiente", dot: "bg-gray-400" },
};

const orderStatusConfig: Record<string, { label: string; dot: string }> = {
  DRAFT: { label: "Borrador", dot: "bg-gray-400" },
  SENT: { label: "Enviado", dot: "bg-blue-500" },
  PARTIAL: { label: "Parcial", dot: "bg-yellow-500" },
  RECEIVED: { label: "Recibido", dot: "bg-green-500" },
  CLOSED: { label: "Cerrado", dot: "bg-gray-400" },
};

const incidentStatusConfig: Record<string, { label: string; dot: string }> = {
  REGISTERED: { label: "Registrada", dot: "bg-yellow-500" },
  NOTIFIED: { label: "Notificada", dot: "bg-blue-500" },
  REVIEWED: { label: "Revisada", dot: "bg-purple-500" },
  CLOSED: { label: "Cerrada", dot: "bg-green-500" },
};

// ============================================================
// PAGE
// ============================================================

export default async function DashboardPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [kpis, alerts, todayOps, recent] = await Promise.all([
    dashboardService.getKpis(tenantId),
    dashboardService.getAlerts(tenantId),
    dashboardService.getTodayOps(tenantId),
    dashboardService.getRecent(tenantId),
  ]);

  const totalAlerts =
    alerts.openIncidents.length +
    alerts.failedDeliveries.length +
    alerts.incompleteOrders.length;

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* BLOCK 1: KPIs */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Incidencias abiertas"
          value={kpis.openIncidents}
          color={kpis.openIncidents > 0 ? "red" : "green"}
          href="/incidents?status=REGISTERED"
        />
        <KpiCard
          label="Pedidos pendientes"
          value={kpis.pendingOrders}
          color={kpis.pendingOrders > 0 ? "orange" : "green"}
          href="/purchases"
        />
        <KpiCard
          label="Recepciones OK hoy"
          value={kpis.todayReceptionsOk}
          color="green"
          href="/reception"
        />
        <KpiCard
          label="Vehiculos en uso"
          value={kpis.vehiclesInUse}
          color={kpis.vehiclesInUse > 0 ? "blue" : "gray"}
          href="/vehicles"
        />
        <KpiCard
          label="Entregas en curso"
          value={kpis.activeDeliveries}
          color={kpis.activeDeliveries > 0 ? "blue" : "gray"}
          href="/vehicles/deliveries"
        />
      </div>

      {/* ============================================================ */}
      {/* BLOCK 2: CRITICAL ALERTS */}
      {/* ============================================================ */}
      {totalAlerts > 0 && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-bold text-red-900 mb-4">
            Atencion — {totalAlerts} problema{totalAlerts !== 1 ? "s" : ""} activo{totalAlerts !== 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Open incidents */}
            {alerts.openIncidents.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Incidencias sin resolver ({alerts.openIncidents.length})
                </h3>
                <div className="space-y-1.5">
                  {alerts.openIncidents.map((inc) => (
                    <Link
                      key={inc.id}
                      href={`/incidents/${inc.id}`}
                      className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm hover:bg-red-100 transition-colors"
                    >
                      <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                      <span className="text-gray-900">
                        <span className="font-medium">{incidentTypeLabels[inc.type] || inc.type}</span>
                        {" — "}
                        <span className="text-gray-500">
                          {inc.reception.receptionNumber} / {inc.reception.purchaseOrder.orderNumber}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Failed deliveries */}
            {alerts.failedDeliveries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Entregas fallidas ({alerts.failedDeliveries.length})
                </h3>
                <div className="space-y-1.5">
                  {alerts.failedDeliveries.map((d) => (
                    <Link
                      key={d.id}
                      href={`/vehicles/deliveries/${d.id}`}
                      className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm hover:bg-red-100 transition-colors"
                    >
                      <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                      <span className="text-gray-900">
                        <span className="font-medium">{d.deliveryNumber}</span>
                        {" — "}
                        <span className="text-gray-500">{d.customerName}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Incomplete orders */}
            {alerts.incompleteOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Pedidos incompletos ({alerts.incompleteOrders.length})
                </h3>
                <div className="space-y-1.5">
                  {alerts.incompleteOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/purchases/${o.id}`}
                      className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm hover:bg-red-100 transition-colors"
                    >
                      <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                      <span className="text-gray-900">
                        <span className="font-medium">{o.orderNumber}</span>
                        {" — "}
                        <span className="text-gray-500">{o.supplier.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No alerts */}
      {totalAlerts === 0 && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 text-center">
          <p className="text-lg font-bold text-green-800">Todo en orden</p>
          <p className="text-sm text-green-600 mt-1">No hay problemas activos</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* BLOCK 3: TODAY'S OPERATIONS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's receptions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recepciones hoy</h2>
            <Link href="/reception" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Ver todas
            </Link>
          </div>
          {todayOps.todayReceptions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin recepciones hoy</p>
          ) : (
            <div className="space-y-2">
              {todayOps.todayReceptions.map((r) => {
                const cfg = receptionStatusConfig[r.status] || { label: r.status, dot: "bg-gray-400" };
                return (
                  <Link
                    key={r.id}
                    href={`/reception/${r.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                      <div>
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {r.receptionNumber}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {r.purchaseOrder.orderNumber} — {r.purchaseOrder.supplier.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{r.receivedBy.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's deliveries */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Entregas hoy</h2>
            <Link href="/vehicles/deliveries" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Ver todas
            </Link>
          </div>
          {todayOps.todayDeliveries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin entregas hoy</p>
          ) : (
            <div className="space-y-2">
              {todayOps.todayDeliveries.map((d) => {
                const cfg = deliveryStatusConfig[d.status] || { label: d.status, dot: "bg-gray-400" };
                return (
                  <Link
                    key={d.id}
                    href={`/vehicles/deliveries/${d.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {d.deliveryNumber}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {d.customerName}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{d.vehicle?.name || "—"}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BLOCK 4: RECENT ACTIVITY */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent incidents */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Incidencias</h2>
            <Link href="/incidents" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Ver todas
            </Link>
          </div>
          {recent.recentIncidents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin incidencias</p>
          ) : (
            <div className="space-y-2">
              {recent.recentIncidents.map((inc) => {
                const cfg = incidentStatusConfig[inc.status] || { label: inc.status, dot: "bg-gray-400" };
                return (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">
                        {incidentTypeLabels[inc.type] || inc.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {inc.reception.receptionNumber} — {cfg.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Pedidos</h2>
            <Link href="/purchases" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Ver todos
            </Link>
          </div>
          {recent.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin pedidos</p>
          ) : (
            <div className="space-y-2">
              {recent.recentOrders.map((o) => {
                const cfg = orderStatusConfig[o.status] || { label: o.status, dot: "bg-gray-400" };
                return (
                  <Link
                    key={o.id}
                    href={`/purchases/${o.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-mono">{o.orderNumber}</span>
                        <span className="ml-1.5 text-gray-500">{o.supplier.name}</span>
                      </p>
                      <p className="text-xs text-gray-400">{cfg.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent receptions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recepciones</h2>
            <Link href="/reception" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Ver todas
            </Link>
          </div>
          {recent.recentReceptions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin recepciones</p>
          ) : (
            <div className="space-y-2">
              {recent.recentReceptions.map((r) => {
                const cfg = receptionStatusConfig[r.status] || { label: r.status, dot: "bg-gray-400" };
                return (
                  <Link
                    key={r.id}
                    href={`/reception/${r.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-mono">{r.receptionNumber}</span>
                        <span className="ml-1.5 text-gray-500">{r.purchaseOrder.orderNumber}</span>
                      </p>
                      <p className="text-xs text-gray-400">{cfg.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPI CARD COMPONENT
// ============================================================

const colorMap = {
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", value: "text-green-900" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", value: "text-orange-900" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", value: "text-red-900" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", value: "text-blue-900" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", value: "text-gray-700" },
};

function KpiCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: keyof typeof colorMap;
  href: string;
}) {
  const c = colorMap[color];
  return (
    <Link
      href={href}
      className={`rounded-xl border-2 ${c.border} ${c.bg} p-5 hover:shadow-md transition-shadow`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
        {label}
      </p>
      <p className={`mt-2 text-4xl font-black ${c.value}`}>{value}</p>
    </Link>
  );
}
