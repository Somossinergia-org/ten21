"use client";

import { approveDeletionAction } from "@/actions/compliance.actions";
import { Check, X } from "lucide-react";

type Deletion = { id: string; type: string; status: string; reason: string; tenantId: string; createdAt: Date };

export function AdminComplianceClient({ deletions }: { deletions: Deletion[] }) {
  const pending = deletions.filter((d) => d.status === "REQUESTED");
  const others = deletions.filter((d) => d.status !== "REQUESTED");

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase text-amber-400 mb-2">Pendientes de aprobacion ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">Sin solicitudes pendientes</p>
        ) : pending.map((d) => (
          <div key={d.id} className="mb-2 rounded-xl border border-amber-500/20 bg-[#0a1628]/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">{d.type}</span>
              <span className="text-[10px] text-slate-500">{new Date(d.createdAt).toLocaleString("es-ES")}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Tenant: <span className="font-mono text-slate-500">{d.tenantId.substring(0, 12)}...</span></p>
            <p className="text-sm text-slate-300 mb-3">{d.reason}</p>
            <div className="flex gap-2">
              <button onClick={() => approveDeletionAction({ requestId: d.id, approved: true })}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700">
                <Check size={12} /> Aprobar
              </button>
              <button onClick={() => approveDeletionAction({ requestId: d.id, approved: false })}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                <X size={12} /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Historial ({others.length})</h3>
        <div className="space-y-1.5">
          {others.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-[#1a2d4a] bg-[#0a1628]/50 px-4 py-2 opacity-70">
              <span className="text-sm text-slate-400">{d.type}</span>
              <span className="text-xs text-slate-500">{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
