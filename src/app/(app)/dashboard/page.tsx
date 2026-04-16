import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as dashboardService from "@/services/dashboard.service";
import * as sparklineService from "@/services/sparkline.service";
import { DashboardSparklines } from "./dashboard-sparklines";
import { VoiceBriefing } from "@/components/dashboard/voice-briefing";

const incidentTypeLabels: Record<string, string> = { QUANTITY_MISMATCH: "Diferencia cantidad", DAMAGED: "Dañado", WRONG_PRODUCT: "Producto equivocado", OTHER: "Otro" };
const receptionStatusConfig: Record<string, { label: string; color: string }> = { COMPLETED: { label: "OK", color: "text-emerald-400" }, WITH_INCIDENTS: { label: "Con incidencias", color: "text-red-400" }, PENDING: { label: "Pendiente", color: "text-slate-500" }, CHECKING: { label: "En chequeo", color: "text-yellow-400" } };
const deliveryStatusConfig: Record<string, { label: string; color: string }> = { ASSIGNED: { label: "Asignada", color: "text-blue-400" }, IN_TRANSIT: { label: "En ruta", color: "text-yellow-400" }, DELIVERED: { label: "Entregada", color: "text-emerald-400" }, FAILED: { label: "Fallida", color: "text-red-400" }, PENDING: { label: "Pendiente", color: "text-slate-500" } };
const orderStatusConfig: Record<string, { label: string; color: string }> = { DRAFT: { label: "Borrador", color: "text-slate-500" }, SENT: { label: "Enviado", color: "text-blue-400" }, PARTIAL: { label: "Parcial", color: "text-yellow-400" }, RECEIVED: { label: "Recibido", color: "text-emerald-400" }, CLOSED: { label: "Cerrado", color: "text-slate-500" } };
const incidentStatusConfig: Record<string, { label: string; color: string }> = { REGISTERED: { label: "Registrada", color: "text-yellow-400" }, NOTIFIED: { label: "Notificada", color: "text-blue-400" }, REVIEWED: { label: "Revisada", color: "text-purple-400" }, CLOSED: { label: "Cerrada", color: "text-emerald-400" } };

// HUD color map for KPIs
const kpiColors = {
  red: { border: "border-red-500/30", glow: "glow-red", value: "text-red-400", label: "text-red-500/60" },
  orange: { border: "border-orange-500/30", glow: "", value: "text-orange-400", label: "text-orange-500/60" },
  green: { border: "border-emerald-500/30", glow: "glow-green", value: "text-emerald-400", label: "text-emerald-500/60" },
  blue: { border: "border-cyan-500/30", glow: "glow-cyan", value: "text-cyan-400", label: "text-cyan-500/60" },
  gray: { border: "border-slate-700", glow: "", value: "text-slate-500", label: "text-slate-600" },
};

export default async function DashboardPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [kpis, alerts, todayOps, recent, incidentsByDay, deliveriesByDay] = await Promise.all([
    dashboardService.getKpis(tenantId), dashboardService.getAlerts(tenantId),
    dashboardService.getTodayOps(tenantId), dashboardService.getRecent(tenantId),
    sparklineService.getIncidentsByDay(tenantId), sparklineService.getDeliveriesByDay(tenantId),
  ]);

  const totalAlerts = alerts.openIncidents.length + alerts.failedDeliveries.length + alerts.incompleteOrders.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <VoiceBriefing data={{ openIncidents: kpis.openIncidents, pendingOrders: kpis.pendingOrders, todayReceptionsOk: kpis.todayReceptionsOk, vehiclesInUse: kpis.vehiclesInUse, activeDeliveries: kpis.activeDeliveries, alertCount: totalAlerts }} />
        <p className="text-xs text-slate-600 hidden sm:block font-mono">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Status banner */}
      {totalAlerts > 0 ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-8 py-8 text-center glow-red">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400/60">Tienes</p>
          <p className="text-7xl font-black text-red-400 mt-1 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">{totalAlerts}</p>
          <p className="mt-1 text-base font-black uppercase tracking-widest text-red-300/80">
            problema{totalAlerts !== 1 ? "s" : ""} importante{totalAlerts !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-8 py-6 text-center glow-green">
          <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Todo bajo control</p>
          <p className="mt-1 text-sm text-emerald-500/50">No hay problemas activos</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {([
          { label: "Incidencias", value: kpis.openIncidents, color: kpis.openIncidents > 0 ? "red" : "green", href: "/incidents?status=REGISTERED" },
          { label: "Pedidos", value: kpis.pendingOrders, color: kpis.pendingOrders > 0 ? "orange" : "green", href: "/purchases" },
          { label: "Recepciones", value: kpis.todayReceptionsOk, color: "green" as const, href: "/reception" },
          { label: "Vehiculos", value: kpis.vehiclesInUse, color: kpis.vehiclesInUse > 0 ? "blue" : "gray", href: "/vehicles" },
          { label: "Entregas", value: kpis.activeDeliveries, color: kpis.activeDeliveries > 0 ? "blue" : "gray", href: "/vehicles/deliveries" },
        ] as const).map((kpi) => {
          const c = kpiColors[kpi.color];
          return (
            <Link key={kpi.label} href={kpi.href} className={`rounded-xl bg-[#0a1628] border ${c.border} ${c.glow} p-4 text-center hover:bg-[#0f1f38] transition-all`}>
              <p className={`text-5xl font-black tracking-tight ${c.value} drop-shadow-[0_0_10px_currentColor]`}>{kpi.value}</p>
              <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${c.label}`}>{kpi.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Sparklines */}
      <DashboardSparklines incidentsByDay={incidentsByDay} deliveriesByDay={deliveriesByDay} />

      {/* Alerts */}
      {totalAlerts > 0 && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/60 mb-3">Problemas detectados</h2>
          <div className="space-y-1.5">
            {alerts.openIncidents.map((inc) => (
              <Link key={`inc-${inc.id}`} href={`/incidents/${inc.id}`} className="flex items-center gap-3 rounded-lg bg-[#0a1628] border border-[#1a2d4a] px-4 py-3 hover:border-red-500/30 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-200 truncate">{incidentTypeLabels[inc.type] || inc.type}</p><p className="text-xs text-slate-500">{inc.reception.receptionNumber} / {inc.reception.purchaseOrder.orderNumber}</p></div>
                <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">Incidencia</span>
              </Link>
            ))}
            {alerts.failedDeliveries.map((d) => (
              <Link key={`del-${d.id}`} href={`/vehicles/deliveries/${d.id}`} className="flex items-center gap-3 rounded-lg bg-[#0a1628] border border-[#1a2d4a] px-4 py-3 hover:border-red-500/30 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-200 truncate">{d.deliveryNumber} — {d.customerName}</p><p className="text-xs text-slate-500">{d.assignedTo?.name || ""}</p></div>
                <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">Entrega</span>
              </Link>
            ))}
            {alerts.incompleteOrders.map((o) => (
              <Link key={`ord-${o.id}`} href={`/purchases/${o.id}`} className="flex items-center gap-3 rounded-lg bg-[#0a1628] border border-[#1a2d4a] px-4 py-3 hover:border-orange-500/30 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-200 truncate">{o.orderNumber} — {o.supplier.name}</p><p className="text-xs text-slate-500">Recibido parcialmente</p></div>
                <span className="rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">Pedido</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Today */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/40 mb-4">Hoy en tienda</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-[#0a1628] border border-[#1a2d4a] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-300">Recepciones</h3>
              <Link href="/reception" className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400">Ver todas →</Link>
            </div>
            {todayOps.todayReceptions.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">Sin recepciones hoy</p>
            ) : (
              <div className="space-y-1.5">
                {todayOps.todayReceptions.map((r) => {
                  const cfg = receptionStatusConfig[r.status] || { label: r.status, color: "text-slate-500" };
                  return (
                    <Link key={r.id} href={`/reception/${r.id}`} className="flex items-center justify-between rounded-lg bg-[#050a14] border border-[#1a2d4a]/50 px-3 py-2 hover:border-cyan-500/20 transition-colors">
                      <div className="flex items-center gap-2"><span className={`text-xs font-mono font-bold ${cfg.color}`}>{r.receptionNumber}</span><span className="text-xs text-slate-500">{r.purchaseOrder.supplier.name}</span></div>
                      <span className="text-[10px] text-slate-600">{r.receivedBy.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <div className="rounded-xl bg-[#0a1628] border border-[#1a2d4a] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-300">Entregas</h3>
              <Link href="/vehicles/deliveries" className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400">Ver todas →</Link>
            </div>
            {todayOps.todayDeliveries.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">Sin entregas hoy</p>
            ) : (
              <div className="space-y-1.5">
                {todayOps.todayDeliveries.map((d) => {
                  const cfg = deliveryStatusConfig[d.status] || { label: d.status, color: "text-slate-500" };
                  return (
                    <Link key={d.id} href={`/vehicles/deliveries/${d.id}`} className="flex items-center justify-between rounded-lg bg-[#050a14] border border-[#1a2d4a]/50 px-3 py-2 hover:border-cyan-500/20 transition-colors">
                      <div className="flex items-center gap-2"><span className={`text-xs font-bold ${cfg.color}`}>{d.deliveryNumber}</span><span className="text-xs text-slate-500">{d.customerName}</span></div>
                      <span className="text-[10px] text-slate-600">{d.vehicle?.name || ""}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/40 mb-4">Actividad reciente</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { title: "Incidencias", href: "/incidents", items: recent.recentIncidents.map((inc) => ({ id: inc.id, href: `/incidents/${inc.id}`, label: incidentTypeLabels[inc.type] || inc.type, sub: `${inc.reception.receptionNumber} — ${(incidentStatusConfig[inc.status] || { label: inc.status }).label}`, color: (incidentStatusConfig[inc.status] || { color: "text-slate-500" }).color })) },
            { title: "Pedidos", href: "/purchases", items: recent.recentOrders.map((o) => ({ id: o.id, href: `/purchases/${o.id}`, label: `${o.orderNumber} ${o.supplier.name}`, sub: (orderStatusConfig[o.status] || { label: o.status }).label, color: (orderStatusConfig[o.status] || { color: "text-slate-500" }).color })) },
            { title: "Recepciones", href: "/reception", items: recent.recentReceptions.map((r) => ({ id: r.id, href: `/reception/${r.id}`, label: `${r.receptionNumber} ${r.purchaseOrder.orderNumber}`, sub: (receptionStatusConfig[r.status] || { label: r.status }).label, color: (receptionStatusConfig[r.status] || { color: "text-slate-500" }).color })) },
          ].map((section) => (
            <div key={section.title} className="rounded-xl bg-[#0a1628] border border-[#1a2d4a] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-300">{section.title}</h3>
                <Link href={section.href} className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400">Ver →</Link>
              </div>
              {section.items.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-3">Sin datos</p>
              ) : (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link key={item.id} href={item.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#050a14] transition-colors">
                      <span className={`h-1.5 w-1.5 rounded-full bg-current ${item.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-300 truncate">{item.label}</p>
                        <p className="text-[10px] text-slate-600">{item.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
