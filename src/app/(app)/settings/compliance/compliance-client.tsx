"use client";

import { useState } from "react";
import { requestDataExportAction, requestDataDeletionAction } from "@/actions/compliance.actions";
import { Download, Trash2, Shield } from "lucide-react";

type Export = { id: string; type: string; status: string; expiresAt: Date | null; createdAt: Date; fileAssetId: string | null };
type Deletion = { id: string; type: string; status: string; reason: string; createdAt: Date };

export function ComplianceClient({ exports, deletions }: { exports: Export[]; deletions: Deletion[] }) {
  const [showDeletion, setShowDeletion] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    await requestDataExportAction({ type: "FULL_EXPORT" });
    setLoading(false);
  }

  async function handleDeletion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await requestDataDeletionAction({
      type: fd.get("type") as string,
      reason: fd.get("reason") as string,
    });
    setShowDeletion(false);
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-200">Derechos RGPD</p>
            <p className="text-xs text-slate-400 mt-1">Puedes solicitar exportacion completa de datos o borrado/anonimizacion. Los datos financieros se conservan por obligacion legal.</p>
          </div>
        </div>
      </div>

      {/* Export section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50">Exportaciones</h3>
          <button onClick={handleExport} disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
            <Download size={12} /> Solicitar export
          </button>
        </div>
        <div className="space-y-2">
          {exports.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">Sin exportaciones</p>
          ) : exports.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-2">
              <div>
                <p className="text-sm text-slate-200">{e.type}</p>
                <p className="text-[10px] text-slate-500">{new Date(e.createdAt).toLocaleString("es-ES")}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${e.status === "READY" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deletion section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50">Solicitudes de borrado</h3>
          <button onClick={() => setShowDeletion(!showDeletion)} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
            <Trash2 size={12} /> Nueva solicitud
          </button>
        </div>

        {showDeletion && (
          <form onSubmit={handleDeletion} className="mb-3 rounded-xl border border-red-500/20 bg-[#0a1628]/80 p-4 space-y-2">
            <select name="type" required className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200">
              <option value="CUSTOMER_DATA">Datos de cliente</option>
              <option value="TENANT_DATA">Datos del tenant</option>
            </select>
            <textarea name="reason" required placeholder="Motivo (obligatorio)" rows={2} className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200" />
            <button type="submit" disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">Solicitar</button>
          </form>
        )}

        <div className="space-y-2">
          {deletions.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">Sin solicitudes</p>
          ) : deletions.map((d) => (
            <div key={d.id} className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-200">{d.type}</p>
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">{d.status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{d.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
