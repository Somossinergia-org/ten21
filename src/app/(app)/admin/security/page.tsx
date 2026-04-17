import { requireSuperAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as securityService from "@/services/security.service";

const severityColors: Record<string, string> = {
  INFO: "text-blue-400", WARNING: "text-amber-400",
  HIGH: "text-red-400", CRITICAL: "text-red-500",
};

export default async function AdminSecurityPage() {
  await requireSuperAdmin();
  const events = await securityService.listSecurityEvents({ limit: 100 });

  return (
    <div>
      <PageHeader title="Eventos de seguridad" />
      <div className="mt-4 space-y-1.5">
        {events.length === 0 ? (
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-8 text-center">
            <p className="text-sm text-slate-500">Sin eventos de seguridad</p>
          </div>
        ) : events.map((e) => (
          <div key={e.id} className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${severityColors[e.severity]}`}>{e.severity}</span>
              <span className="text-xs text-slate-400">{e.type}</span>
              {e.ipAddress && <span className="text-[10px] text-slate-600 font-mono">{e.ipAddress}</span>}
              <span className="ml-auto text-[10px] text-slate-600">{new Date(e.createdAt).toLocaleString("es-ES")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
