import { requireSuperAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";

export default async function AdminTenantsPage() {
  await requireSuperAdmin();

  const tenants = await db.tenant.findMany({
    include: {
      _count: { select: { users: true, salesOrders: true, deliveries: true } },
      tenantOnboarding: { select: { status: true } },
      tenantConfig: { select: { businessName: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Tenants" />
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 hidden md:table-cell">Config</th>
              <th className="px-4 py-3 text-center">Usuarios</th>
              <th className="px-4 py-3 text-center">Ventas</th>
              <th className="px-4 py-3 text-center">Onboarding</th>
              <th className="px-4 py-3 text-center">Activo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-200 font-medium">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-cyan-500">{t.slug}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{t.tenantConfig?.businessName || "—"} {t.tenantConfig?.city ? `(${t.tenantConfig.city})` : ""}</td>
                <td className="px-4 py-3 text-center text-slate-400">{t._count.users}</td>
                <td className="px-4 py-3 text-center text-slate-400">{t._count.salesOrders}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    t.tenantOnboarding?.status === "LIVE" ? "bg-emerald-500/10 text-emerald-400" :
                    t.tenantOnboarding?.status === "READY" ? "bg-cyan-500/10 text-cyan-400" :
                    "bg-slate-500/10 text-slate-500"
                  }`}>{t.tenantOnboarding?.status || "SIN ONBOARDING"}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs ${t.active ? "text-emerald-400" : "text-red-400"}`}>{t.active ? "Si" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
