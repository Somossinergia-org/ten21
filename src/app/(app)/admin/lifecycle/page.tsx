import { requireRole } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";
import { Clock, AlertTriangle, PauseCircle, CheckCircle } from "lucide-react";

export default async function LifecyclePage() {
  await requireRole(["JEFE"]);

  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86400000);

  const [trialEnding, pastDue, suspended, activeBackups] = await Promise.all([
    db.tenantSubscription.count({
      where: { status: "TRIAL", trialEndsAt: { lte: in14, gte: now } },
    }),
    db.tenantSubscription.count({ where: { status: "PAST_DUE" } }),
    db.tenant.count({ where: { suspendedAt: { not: null } } }),
    db.backupJob.count({ where: { status: { in: ["QUEUED", "RUNNING"] } } }),
  ]);

  const recentBackups = await db.backupJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader title="Lifecycle SaaS" />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Clock size={18} className="text-amber-400 mb-1" />
          <p className="text-xs text-amber-400 uppercase">Trials por vencer</p>
          <p className="text-2xl font-bold text-amber-300">{trialEnding}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertTriangle size={18} className="text-red-400 mb-1" />
          <p className="text-xs text-red-400 uppercase">Impagos</p>
          <p className="text-2xl font-bold text-red-300">{pastDue}</p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <PauseCircle size={18} className="text-slate-500 mb-1" />
          <p className="text-xs text-slate-500 uppercase">Suspendidos</p>
          <p className="text-2xl font-bold text-slate-300">{suspended}</p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <CheckCircle size={18} className="text-cyan-400 mb-1" />
          <p className="text-xs text-cyan-400 uppercase">Backups activos</p>
          <p className="text-2xl font-bold text-cyan-300">{activeBackups}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Backups recientes</h3>
        {recentBackups.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-6">Sin backups registrados</p>
        ) : (
          <div className="space-y-1.5">
            {recentBackups.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-2">
                <div>
                  <p className="text-sm text-slate-200">{b.type}</p>
                  <p className="text-[10px] text-slate-500">{new Date(b.createdAt).toLocaleString("es-ES")}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                  b.status === "FAILED" ? "bg-red-500/10 text-red-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
