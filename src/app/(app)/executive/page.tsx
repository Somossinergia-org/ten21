import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as treasuryService from "@/services/treasury.service";
import * as profitService from "@/services/profitability.service";
import * as dashboardService from "@/services/dashboard.service";
import { db } from "@/lib/db";
import {
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Receipt,
  Package, Truck, Ticket, BarChart3,
} from "lucide-react";

function money(v: number) { return v.toFixed(2) + " €"; }

export default async function ExecutivePage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [
    forecast7, forecast30, forecast60, summary,
    marginAlerts, kpis,
    unbilledSales, overdueInvoices,
  ] = await Promise.all([
    treasuryService.getForecast(tenantId, 7),
    treasuryService.getForecast(tenantId, 30),
    treasuryService.getForecast(tenantId, 60),
    treasuryService.getSummary(tenantId),
    profitService.getMarginAlerts(tenantId),
    dashboardService.getKpis(tenantId),
    db.salesOrder.count({ where: { tenantId, status: { in: ["DELIVERED", "RESERVED", "IN_DELIVERY"] }, paymentStatus: "UNBILLED" } }),
    db.customerInvoice.count({ where: { tenantId, status: "ISSUED", dueDate: { lt: new Date() } } }),
  ]);

  const cards = [
    { label: "Caja 7 dias", value: money(forecast7.balance), color: forecast7.balance >= 0 ? "text-emerald-400" : "text-red-400", icon: <DollarSign size={16} /> },
    { label: "Caja 30 dias", value: money(forecast30.balance), color: forecast30.balance >= 0 ? "text-emerald-400" : "text-red-400", icon: <DollarSign size={16} /> },
    { label: "Caja 60 dias", value: money(forecast60.balance), color: forecast60.balance >= 0 ? "text-emerald-400" : "text-red-400", icon: <DollarSign size={16} /> },
    { label: "Ventas sin facturar", value: String(unbilledSales), color: unbilledSales > 0 ? "text-amber-400" : "text-emerald-400", icon: <Receipt size={16} />, href: "/sales" },
    { label: "Facturas vencidas", value: String(overdueInvoices), color: overdueInvoices > 0 ? "text-red-400" : "text-emerald-400", icon: <AlertTriangle size={16} />, href: "/finance/invoices" },
    { label: "Ventas pendientes", value: String(kpis.pendingSales), color: "text-cyan-400", icon: <BarChart3 size={16} />, href: "/sales" },
    { label: "Stock bajo", value: String(kpis.lowStockProducts), color: kpis.lowStockProducts > 0 ? "text-red-400" : "text-emerald-400", icon: <Package size={16} />, href: "/inventory" },
    { label: "Entregas activas", value: String(kpis.activeDeliveries), color: "text-cyan-400", icon: <Truck size={16} /> },
    { label: "Tickets posventa", value: String(kpis.openPostSaleTickets), color: kpis.openPostSaleTickets > 0 ? "text-amber-400" : "text-emerald-400", icon: <Ticket size={16} />, href: "/post-sales" },
  ];

  return (
    <div>
      <PageHeader title="Cockpit Ejecutivo" />

      {/* KPI Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {cards.map((c) => {
          const content = (
            <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-600">{c.icon}</span>
                <p className="text-[10px] text-slate-500 uppercase">{c.label}</p>
              </div>
              <p className={`text-xl font-mono font-bold ${c.color}`}>{c.value}</p>
            </div>
          );
          return c.href ? <Link key={c.label} href={c.href}>{content}</Link> : <div key={c.label}>{content}</div>;
        })}
      </div>

      {/* Financial summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-xs font-bold uppercase text-red-400 flex items-center gap-1 mb-3"><AlertTriangle size={12} /> Pagos y cobros vencidos</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Por cobrar</p>
              <p className="font-mono text-lg text-emerald-400 flex items-center gap-1"><TrendingUp size={14} /> {money(summary.overdue.income)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Por pagar</p>
              <p className="font-mono text-lg text-red-400 flex items-center gap-1"><TrendingDown size={14} /> {money(summary.overdue.expense)}</p>
            </div>
          </div>
        </div>

        {/* Margin alerts */}
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <h3 className="text-xs font-bold uppercase text-cyan-500/50 mb-3">Alertas de margen ({marginAlerts.length})</h3>
          {marginAlerts.length === 0 ? (
            <p className="text-sm text-emerald-400">Sin alertas de margen</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {marginAlerts.slice(0, 8).map((a, i) => (
                <Link key={i} href={`/sales/${a.salesOrderId}`} className="block text-xs text-slate-400 hover:text-cyan-400 truncate">
                  {a.message}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
