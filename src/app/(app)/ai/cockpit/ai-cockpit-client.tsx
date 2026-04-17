"use client";

import { Brain, Lightbulb, Zap, FileText } from "lucide-react";

type Insight = { id: string; severity: string; title: string; summary: string; category: string; agent: { code: string; name: string } };
type Action = { id: string; priority: string; title: string; recommendation: string; rationale: string; agent: { code: string; name: string } };
type Brief = { executiveSummary: string; createdAt: Date } | null;

const severityColors: Record<string, string> = {
  AI_INFO: "border-l-blue-500", AI_WARNING: "border-l-amber-500",
  AI_HIGH: "border-l-red-400", AI_CRITICAL: "border-l-red-600",
};

export function AiCockpitClient({ insights, actions, brief }: {
  insights: Insight[]; actions: Action[]; brief: Brief;
}) {
  return (
    <div className="mt-4 space-y-6">
      {/* Daily brief */}
      {brief && (
        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-400">Briefing Ejecutivo</h3>
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{brief.executiveSummary}</p>
          <p className="text-[10px] text-slate-600 mt-3">{new Date(brief.createdAt).toLocaleString("es-ES")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insights */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
            <Lightbulb size={14} /> Insights ({insights.length})
          </h3>
          {insights.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Sin insights activos</p>
          ) : (
            <div className="space-y-2">
              {insights.map((i) => (
                <div key={i.id} className={`rounded-lg border-l-2 ${severityColors[i.severity]} border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-200">{i.title}</p>
                    <span className="text-[9px] text-cyan-500 font-mono">{i.agent.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{i.summary}</p>
                  <span className="text-[9px] text-slate-600 mt-1 inline-block">{i.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
            <Zap size={14} /> Acciones sugeridas ({actions.length})
          </h3>
          {actions.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Sin acciones pendientes</p>
          ) : (
            <div className="space-y-2">
              {actions.map((a) => (
                <div key={a.id} className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-200">{a.title}</p>
                    <span className="text-[9px] text-cyan-500 font-mono">{a.agent.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{a.recommendation}</p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">{a.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent team overview */}
      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
          <Brain size={14} /> Equipo de Agentes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { name: "Ventas", icon: "📊" }, { name: "Clientes", icon: "👥" },
            { name: "Compras", icon: "🛒" }, { name: "Almacen", icon: "📦" },
            { name: "Inventario", icon: "📋" }, { name: "Entregas", icon: "🚛" },
            { name: "Finanzas", icon: "💰" }, { name: "Tesoreria", icon: "🏦" },
            { name: "Facturacion", icon: "📄" }, { name: "Rentabilidad", icon: "📈" },
            { name: "Posventa", icon: "🎧" }, { name: "Automatizaciones", icon: "⚡" },
          ].map((a) => (
            <div key={a.name} className="rounded-lg border border-[#1a2d4a] bg-[#050a14]/50 p-2.5 text-center hover:bg-white/[0.02] transition-colors">
              <span className="text-lg">{a.icon}</span>
              <p className="text-[10px] text-slate-400 mt-1">{a.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
