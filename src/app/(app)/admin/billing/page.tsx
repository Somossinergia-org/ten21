import { requireRole } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";

export default async function AdminBillingPage() {
  await requireRole(["JEFE"]);

  const subscriptions = await db.tenantSubscription.findMany({
    include: {
      tenant: { select: { name: true, slug: true } },
      plan: { select: { name: true, priceCents: true, currency: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus = subscriptions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    TRIAL: "text-blue-400", ACTIVE: "text-emerald-400",
    PAST_DUE: "text-red-400", CANCELLED: "text-slate-500",
    PAUSED: "text-amber-400", EXPIRED: "text-red-500",
  };

  return (
    <div>
      <PageHeader title="Billing de tenants" />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-3 text-center">
            <p className={`text-xs uppercase ${statusColors[status] || "text-slate-500"}`}>{status}</p>
            <p className="text-xl font-bold text-slate-200">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Fin trial</th>
              <th className="px-4 py-3">Renovacion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {subscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-300">{s.tenant.name}</td>
                <td className="px-4 py-3 text-slate-400">{s.plan.name}</td>
                <td className="px-4 py-3 font-mono text-slate-300">{(s.plan.priceCents / 100).toFixed(2)} {s.plan.currency}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs font-medium ${statusColors[s.status] || ""}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{s.trialEndsAt ? new Date(s.trialEndsAt).toLocaleDateString("es-ES") : "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("es-ES") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
