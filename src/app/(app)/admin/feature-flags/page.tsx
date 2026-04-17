import { requireSuperAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";

export default async function FeatureFlagsPage() {
  await requireSuperAdmin();

  const flags = await db.featureFlag.findMany({
    orderBy: [{ scope: "asc" }, { code: "asc" }],
  });

  return (
    <div>
      <PageHeader title="Feature Flags" />
      <div className="mt-4 space-y-2 max-w-lg">
        {flags.length === 0 ? (
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-8 text-center">
            <p className="text-sm text-slate-500">Sin feature flags configurados</p>
          </div>
        ) : flags.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3">
            <div>
              <p className="text-sm font-mono text-slate-200">{f.code}</p>
              <p className="text-[10px] text-slate-600">{f.scope}{f.tenantId ? ` (tenant: ${f.tenantId.substring(0, 8)}...)` : ""}</p>
              {f.notes && <p className="text-xs text-slate-500 mt-0.5">{f.notes}</p>}
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${f.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {f.enabled ? "ON" : "OFF"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
