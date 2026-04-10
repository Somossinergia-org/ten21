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
    <div className="space-y-10">
      {/* ============================================================ */}
      {/* BLOCK 0: GLOBAL STATUS */}
      {/* ============================================================ */}
      {totalAlerts > 0 ? (
        <div className="rounded-2xl bg-red-700 px-8 py-8 text-center shadow-xl">
          <p className="text-lg font-bold uppercase tracking-wider text-red-200">
            Tienes
          </p>
          <p className="text-6xl font-black text-white mt-1">
            {totalAlerts}
          </p>
          <p className="mt-1 text-xl font-black uppercase tracking-wide text-white">
            problema{totalAlerts !== 1 ? "s" : ""} importante{totalAlerts !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-green-600 px-8 py-6 text-center shadow-lg">
          <p className="text-3xl font-black text-white">
            Todo bajo control
          </p>
          <p className="mt-1 text-sm font-medium text-green-100">
            No hay problemas activos
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* BLOCK 1: KPIs */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Incidencias" value={kpis.openIncidents} color={kpis.openIncidents > 0 ? "red" : "green"} href="/incidents?status=REGISTERED" />
        <KpiCard label="Pedidos" value={kpis.pendingOrders} color={kpis.pendingOrders > 0 ? "orange" : "green"} href="/purchases" />
        <KpiCard label="Recepciones OK" value={kpis.todayReceptionsOk} color="green" href="/reception" />
        <KpiCard label="Vehiculos" value={kpis.vehiclesInUse} color={kpis.vehiclesInUse > 0 ? "blue" : "gray"} href="/vehicles" />
        <KpiCard label="Entregas" value={kpis.activeDeliveries} color={kpis.activeDeliveries > 0 ? "blue" : "gray"} href="/vehicles/deliveries" />
      </div>

      {/* ============================================================ */}
      {/* BLOCK 2: CRITICAL ALERTS (flat list) */}
      {/* ============================================================ */}
      {totalAlerts > 0 && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-900 mb-4">
            Problemas detectados
          </h2>
          <div className="space-y-2">
            {alerts.openIncidents.map((inc) => (
              <AlertRow
                key={`inc-${inc.id}`}
                href={`/incidents/${inc.id}`}
                dot="bg-red-500"
                label={incidentTypeLabels[inc.type] || inc.type}
                detail={`${inc.reception.receptionNumber} / ${inc.reception.purchaseOrder.orderNumber}`}
                tag="Incidencia"
              />
            ))}
            {alerts.failedDeliveries.map((d) => (
              <AlertRow
                key={`del-${d.id}`}
                href={`/vehicles/deliveries/${d.id}`}
                dot="bg-red-500"
                label={`${d.deliveryNumber} — ${d.customerName}`}
                detail={d.assignedTo?.name || ""}
                tag="Entrega fallida"
              />
            ))}
            {alerts.incompleteOrders.map((o) => (
              <AlertRow
                key={`ord-${o.id}`}
                href={`/purchases/${o.id}`}
                dot="bg-orange-500"
                label={`${o.orderNumber} — ${o.supplier.name}`}
                detail="Recibido parcialmente"
                tag="Pedido"
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BLOCK 3: TODAY'S OPERATIONS */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-wider text-gray-400 mb-4">
          Hoy en tienda
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Today's receptions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Recepciones</h3>
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
                            {r.purchaseOrder.supplier.name}
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
              <h3 className="text-base font-bold text-gray-900">Entregas</h3>
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
                      <span className="text-xs text-gray-400">{d.vehicle?.name || ""}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BLOCK 4: RECENT ACTIVITY */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-wider text-gray-400 mb-4">
          Actividad reciente
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RecentCard title="Incidencias" href="/incidents" emptyText="Sin incidencias">
            {recent.recentIncidents.map((inc) => {
              const cfg = incidentStatusConfig[inc.status] || { label: inc.status, dot: "bg-gray-400" };
              return (
                <Link key={inc.id} href={`/incidents/${inc.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors">
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{incidentTypeLabels[inc.type] || inc.type}</p>
                    <p className="text-xs text-gray-400">{inc.reception.receptionNumber} — {cfg.label}</p>
                  </div>
                </Link>
              );
            })}
          </RecentCard>

          <RecentCard title="Pedidos" href="/purchases" emptyText="Sin pedidos">
            {recent.recentOrders.map((o) => {
              const cfg = orderStatusConfig[o.status] || { label: o.status, dot: "bg-gray-400" };
              return (
                <Link key={o.id} href={`/purchases/${o.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors">
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900"><span className="font-mono">{o.orderNumber}</span> <span className="text-gray-500">{o.supplier.name}</span></p>
                    <p className="text-xs text-gray-400">{cfg.label}</p>
                  </div>
                </Link>
              );
            })}
          </RecentCard>

          <RecentCard title="Recepciones" href="/reception" emptyText="Sin recepciones">
            {recent.recentReceptions.map((r) => {
              const cfg = receptionStatusConfig[r.status] || { label: r.status, dot: "bg-gray-400" };
              return (
                <Link key={r.id} href={`/reception/${r.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors">
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900"><span className="font-mono">{r.receptionNumber}</span> <span className="text-gray-500">{r.purchaseOrder.orderNumber}</span></p>
                    <p className="text-xs text-gray-400">{cfg.label}</p>
                  </div>
                </Link>
              );
            })}
          </RecentCard>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

const colorMap = {
  green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-600", value: "text-green-900" },
  orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-600", value: "text-orange-900" },
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-600", value: "text-red-900" },
  blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-600", value: "text-blue-900" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-400", value: "text-gray-600" },
};

function KpiCard({ label, value, color, href }: { label: string; value: number; color: keyof typeof colorMap; href: string }) {
  const c = colorMap[color];
  return (
    <Link href={href} className={`rounded-xl border-2 ${c.border} ${c.bg} p-4 hover:shadow-md transition-shadow text-center`}>
      <p className={`text-5xl font-black tracking-tight ${c.value}`}>{value}</p>
      <p className={`mt-1 text-xs font-bold uppercase tracking-wider ${c.text}`}>{label}</p>
    </Link>
  );
}

function AlertRow({ href, dot, label, detail, tag }: { href: string; dot: string; label: string; detail: string; tag: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-all duration-150 shadow-sm hover:shadow">
      <span className={`h-3 w-3 flex-shrink-0 rounded-full ${dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
      <span className="flex-shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        {tag}
      </span>
    </Link>
  );
}

function RecentCard({ title, href, emptyText, children }: { title: string; href: string; emptyText: string; children: React.ReactNode[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <Link href={href} className="text-xs font-medium text-blue-600 hover:text-blue-800">Ver</Link>
      </div>
      {children.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{emptyText}</p>
      ) : (
        <div className="space-y-1.5">{children}</div>
      )}
    </div>
  );
}
