import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as profitService from "@/services/profitability.service";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default async function ProfitabilityPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [sales, alerts] = await Promise.all([
    profitService.getSalesProfitability(tenantId),
    profitService.getMarginAlerts(tenantId),
  ]);

  const avgMarginPercent = sales.filter((s) => s.marginPercent !== null).reduce((sum, s) => sum + (s.marginPercent || 0), 0) / Math.max(1, sales.filter((s) => s.marginPercent !== null).length);

  return (
    <div>
      <PageHeader title="Rentabilidad" />

      {/* Summary */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <p className="text-[10px] text-slate-500 uppercase">Ventas analizadas</p>
          <p className="text-lg font-bold text-slate-200">{sales.length}</p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <p className="text-[10px] text-slate-500 uppercase">Margen medio</p>
          <p className={`text-lg font-bold ${avgMarginPercent >= 10 ? "text-emerald-400" : avgMarginPercent >= 0 ? "text-amber-400" : "text-red-400"}`}>
            {avgMarginPercent.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <p className="text-[10px] text-slate-500 uppercase">Alertas de margen</p>
          <p className={`text-lg font-bold ${alerts.length > 0 ? "text-red-400" : "text-emerald-400"}`}>{alerts.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-xs font-bold uppercase text-red-400 flex items-center gap-1 mb-2"><AlertTriangle size={12} /> Alertas</h3>
          <div className="space-y-1">
            {alerts.map((a, i) => (
              <Link key={i} href={`/sales/${a.salesOrderId}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400">
                <span className={`text-[10px] font-mono ${a.type === "NEGATIVE_MARGIN" ? "text-red-400" : a.type === "LOW_MARGIN" ? "text-amber-400" : "text-slate-500"}`}>{a.type === "NEGATIVE_MARGIN" ? "NEG" : a.type === "LOW_MARGIN" ? "LOW" : "INC"}</span>
                {a.message}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sales table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Venta</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Margen est.</th>
              <th className="px-4 py-3 text-right">Margen real</th>
              <th className="px-4 py-3 text-center">%</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3"><Link href={`/sales/${s.id}`} className="font-mono text-cyan-400 hover:text-cyan-300">{s.orderNumber}</Link></td>
                <td className="px-4 py-3 text-slate-300">{s.customer}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-200">{s.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-400">{s.estimatedMargin !== null ? s.estimatedMargin.toFixed(2) : "—"}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {s.realMargin !== null ? (
                    <span className={s.realMargin >= 0 ? "text-emerald-400" : "text-red-400"}>{s.realMargin.toFixed(2)}</span>
                  ) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {s.marginPercent !== null ? (
                    <span className={`flex items-center justify-center gap-0.5 text-xs ${s.marginPercent >= 10 ? "text-emerald-400" : s.marginPercent >= 0 ? "text-amber-400" : "text-red-400"}`}>
                      {s.marginPercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {s.marginPercent.toFixed(1)}%
                    </span>
                  ) : <span className="text-xs text-slate-600">{s.marginStatus}</span>}
                </td>
                <td className="px-4 py-3 text-center text-[10px] text-slate-500">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
