"use client";

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type Event = { id: string; severity: string; category: string; code: string; message: string; resolved: boolean; createdAt: Date };
type Summary = { critical: number; errors: number; warnings: number; unresolved: number };

const severityIcons: Record<string, React.ReactNode> = {
  INFO: <Info size={12} className="text-blue-400" />,
  WARNING: <AlertTriangle size={12} className="text-amber-400" />,
  ERROR: <XCircle size={12} className="text-red-400" />,
  CRITICAL: <XCircle size={12} className="text-red-500" />,
};

const severityColors: Record<string, string> = {
  INFO: "border-l-blue-500", WARNING: "border-l-amber-500",
  ERROR: "border-l-red-500", CRITICAL: "border-l-red-600",
};

export function HealthClient({ events, summary }: { events: Event[]; summary: Summary }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
          <p className="text-[10px] text-red-400 uppercase">Criticos</p>
          <p className="text-xl font-bold text-red-400">{summary.critical}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-[#0a1628]/80 p-3 text-center">
          <p className="text-[10px] text-red-300 uppercase">Errores</p>
          <p className="text-xl font-bold text-red-300">{summary.errors}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-[#0a1628]/80 p-3 text-center">
          <p className="text-[10px] text-amber-400 uppercase">Warnings</p>
          <p className="text-xl font-bold text-amber-400">{summary.warnings}</p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Sin resolver</p>
          <p className="text-xl font-bold text-slate-300">{summary.unresolved}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {events.length === 0 ? (
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-8 text-center">
            <CheckCircle size={24} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-slate-400">Sistema saludable, sin eventos</p>
          </div>
        ) : events.map((e) => (
          <div key={e.id} className={`rounded-lg border-l-2 ${severityColors[e.severity]} border border-[#1a2d4a] px-4 py-3 ${e.resolved ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-2">
              {severityIcons[e.severity]}
              <span className="text-xs font-mono text-slate-500">{e.category}</span>
              <span className="text-xs text-slate-600">{e.code}</span>
              {e.resolved && <span className="text-[10px] text-emerald-500">Resuelto</span>}
              <span className="ml-auto text-[10px] text-slate-600">{new Date(e.createdAt).toLocaleString("es-ES")}</span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{e.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
