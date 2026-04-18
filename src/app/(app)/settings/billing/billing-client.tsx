"use client";

import { changePlanAction, cancelSubscriptionAction, reactivateSubscriptionAction } from "@/actions/billing.actions";
import { CreditCard, Check, AlertTriangle, TrendingUp } from "lucide-react";

type Plan = { id: string; code: string; name: string; description: string | null; priceCents: number; currency: string; billingCycle: string; featuresJson: unknown; limitsJson: unknown };
type Subscription = { id: string; status: string; plan: Plan; cancelAtPeriodEnd: boolean; trialEndsAt: Date | null; currentPeriodEnd: Date | null } | null;
type Invoice = { id: string; status: string; amountCents: number; currency: string; issuedAt: Date | null };
type Warning = { metric: string; current: number; limit: number; percent: number };

const statusColors: Record<string, string> = {
  TRIAL: "bg-blue-500/10 text-blue-400",
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAST_DUE: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-slate-500/10 text-slate-400",
  PAUSED: "bg-amber-500/10 text-amber-400",
  EXPIRED: "bg-red-500/10 text-red-500",
};

function money(cents: number, currency: string) {
  return (cents / 100).toFixed(2) + " " + currency;
}

const metricLabels: Record<string, string> = {
  users_active: "Usuarios",
  customers: "Clientes",
  products: "Productos",
  monthly_sales: "Ventas mes",
  active_automations: "Automatizaciones",
};

export function BillingClient({ subscription, plans, invoices, usage, warnings }: {
  subscription: Subscription; plans: Plan[]; invoices: Invoice[]; usage: Record<string, number>; warnings: Warning[];
}) {
  return (
    <div className="mt-4 space-y-6">
      {/* Current subscription */}
      {subscription && (
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Plan actual</p>
              <h3 className="text-xl font-bold text-slate-200 mt-1">{subscription.plan.name}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{money(subscription.plan.priceCents, subscription.plan.currency)} / {subscription.plan.billingCycle === "MONTHLY" ? "mes" : "año"}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[subscription.status]}`}>{subscription.status}</span>
          </div>

          {subscription.trialEndsAt && subscription.status === "TRIAL" && (
            <p className="text-xs text-blue-400 mt-2">Trial hasta {new Date(subscription.trialEndsAt).toLocaleDateString("es-ES")}</p>
          )}
          {subscription.currentPeriodEnd && (
            <p className="text-xs text-slate-500 mt-2">Proxima renovacion: {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES")}</p>
          )}

          <div className="mt-4 flex gap-2">
            {!subscription.cancelAtPeriodEnd && subscription.status === "ACTIVE" && (
              <button onClick={() => cancelSubscriptionAction()} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                Cancelar al fin del periodo
              </button>
            )}
            {subscription.status === "PAUSED" && (
              <button onClick={() => reactivateSubscriptionAction()} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs text-white hover:bg-cyan-700">
                Reactivar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage and warnings */}
      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Uso actual</h3>

        {warnings.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-400 flex items-center gap-1 mb-1"><AlertTriangle size={12} /> Limites proximos</p>
            {warnings.map((w) => (
              <p key={w.metric} className="text-xs text-slate-400">
                {metricLabels[w.metric] || w.metric}: {w.current}/{w.limit} ({w.percent.toFixed(0)}%)
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(usage).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-[#1a2d4a] bg-[#050a14]/50 p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{metricLabels[key] || key}</p>
              <p className="text-lg font-mono font-bold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available plans */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Planes disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan.code === plan.code;
            return (
              <div key={plan.id} className={`rounded-xl border ${isCurrent ? "border-cyan-500/40 bg-cyan-500/5" : "border-[#1a2d4a] bg-[#0a1628]/80"} p-4`}>
                <h4 className="text-lg font-bold text-slate-200">{plan.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                <p className="text-2xl font-mono font-bold text-cyan-400 mt-3">{money(plan.priceCents, plan.currency)}</p>
                <p className="text-[10px] text-slate-500">/{plan.billingCycle === "MONTHLY" ? "mes" : "año"}</p>

                {!isCurrent ? (
                  <button onClick={() => changePlanAction({ planCode: plan.code })}
                    className="mt-4 w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700">
                    Cambiar a este plan
                  </button>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-1 text-xs text-cyan-400">
                    <Check size={12} /> Plan actual
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Facturas de suscripcion</h3>
          <div className="rounded-xl border border-[#1a2d4a] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628]/80">
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Importe</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2d4a]">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2 text-xs text-slate-400">{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("es-ES") : "—"}</td>
                    <td className="px-4 py-2 font-mono text-slate-300">{money(inv.amountCents, inv.currency)}</td>
                    <td className="px-4 py-2 text-center"><span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px]">{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
