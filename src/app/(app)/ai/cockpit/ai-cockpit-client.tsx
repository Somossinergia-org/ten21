"use client";

import { useState, useTransition } from "react";
import { Brain, Lightbulb, Zap, FileText, RefreshCcw, Loader2, ArrowRightLeft } from "lucide-react";
import { InsightCard } from "@/components/ai/insight-card";
import { ActionCard } from "@/components/ai/action-card";
import { HandoffBadge } from "@/components/ai/handoff-badge";
import { CognitiveResponse } from "@/components/ai/cognitive-response";
import { FeedbackButtons } from "@/components/ai/feedback-buttons";
import { triggerInsightSweep } from "@/actions/ai-insights.actions";

type Insight = { id: string; severity: string; title: string; summary: string; category: string; status: string; agent: { code: string; name: string } };
type Action = { id: string; priority: string; title: string; recommendation: string; rationale: string; status: string; agent: { code: string; name: string } };
type Handoff = { id: string; reason: string; urgency: string; fromAgent: { code: string; name: string }; toAgent: { code: string; name: string } };
type Brief = { executiveSummary: string; createdAt: Date } | null;

type AgentResponse = { code: string; name: string; response: string; messageId?: string; conversationId?: string };

export function AiCockpitClient({ insights, actions, handoffs, brief }: {
  insights: Insight[]; actions: Action[]; handoffs: Handoff[]; brief: Brief;
}) {
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [loadingAgent, setLoadingAgent] = useState<string | null>(null);
  const [isSweeping, startSweep] = useTransition();
  const [sweepMsg, setSweepMsg] = useState<string | null>(null);

  function onSweep() {
    startSweep(async () => {
      const res = await triggerInsightSweep();
      if (res.success) {
        setSweepMsg(`Análisis ejecutado: ${res.processed ?? 0} señales detectadas.`);
      } else {
        setSweepMsg(res.error || "Error al ejecutar análisis");
      }
      setTimeout(() => setSweepMsg(null), 4000);
    });
  }

  async function askAgent(code: string, name: string, message: string) {
    setLoadingAgent(code);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message, agentCode: code }),
      });
      const data = await res.json();
      setAgentResponse({
        code, name,
        response: data.response || "Sin respuesta",
        messageId: data.messageId,
        conversationId: data.conversationId,
      });
    } finally {
      setLoadingAgent(null);
    }
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Sweep control */}
      <div className="flex items-center justify-between rounded-xl border border-[#1a2d4a] bg-[#050a14] px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Motor cognitivo</span>
          <span className="text-xs text-slate-400">Analiza todos los dominios y genera insights + acciones + handoffs.</span>
        </div>
        <div className="flex items-center gap-3">
          {sweepMsg && <span className="text-[11px] text-cyan-400">{sweepMsg}</span>}
          <button
            onClick={onSweep}
            disabled={isSweeping}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40"
          >
            {isSweeping ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
            Ejecutar análisis
          </button>
        </div>
      </div>

      {/* Daily brief */}
      {brief && (
        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-400">Briefing Ejecutivo</h3>
          </div>
          <CognitiveResponse text={brief.executiveSummary} />
          <p className="text-[10px] text-slate-600 mt-3">{new Date(brief.createdAt).toLocaleString("es-ES")}</p>
        </div>
      )}

      {/* Handoffs */}
      {handoffs.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-2">
            <ArrowRightLeft size={14} /> Handoffs entre agentes ({handoffs.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {handoffs.map((h) => <HandoffBadge key={h.id} handoff={h} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insights */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
            <Lightbulb size={14} /> Insights ({insights.length})
          </h3>
          {insights.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Sin insights activos. Ejecuta análisis para generar.</p>
          ) : (
            <div className="space-y-2">
              {insights.map((i) => <InsightCard key={i.id} insight={i} />)}
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
              {actions.map((a) => <ActionCard key={a.id} action={a} />)}
            </div>
          )}
        </div>
      </div>

      {/* Agent team */}
      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
          <Brain size={14} /> Equipo de Agentes (8)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            { code: "executive", name: "Ejecutivo", icon: "📊", ask: "Dame el briefing del dia: prioridades, riesgos y acciones" },
            { code: "sales", name: "Ventas", icon: "💰", ask: "Como van las ventas? Hay bloqueos o margenes dudosos?" },
            { code: "purchase", name: "Compras", icon: "🛒", ask: "Hay pedidos parciales, retrasos o desviaciones con proveedores?" },
            { code: "warehouse", name: "Almacen", icon: "📦", ask: "Que recepciones hay pendientes? Hay discrepancias o danos?" },
            { code: "delivery", name: "Entregas", icon: "🚛", ask: "Como esta la agenda de entregas hoy? Hay riesgo de fallos?" },
            { code: "treasury", name: "Tesoreria", icon: "🏦", ask: "Hay tension de caja? Que pagos o cobros estan vencidos?" },
            { code: "billing", name: "Billing SaaS", icon: "💳", ask: "Hay tenants con trial a punto de vencer o impagos?" },
            { code: "security", name: "Seguridad", icon: "🔒", ask: "Hay eventos de seguridad criticos o cuentas bloqueadas?" },
          ].map((a) => (
            <button key={a.code}
              onClick={() => askAgent(a.code, a.name, a.ask)}
              disabled={loadingAgent === a.code}
              className="rounded-lg border border-[#1a2d4a] bg-[#050a14]/50 p-3 text-center hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50">
              {loadingAgent === a.code ? (
                <Loader2 size={20} className="text-cyan-400 animate-spin mx-auto" />
              ) : (
                <span className="text-xl">{a.icon}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">{a.name}</p>
            </button>
          ))}
        </div>

        {/* Agent response drawer */}
        {agentResponse && (
          <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-cyan-400">{agentResponse.name}</h4>
              <button onClick={() => setAgentResponse(null)} className="text-slate-600 hover:text-slate-400 text-xs">Cerrar</button>
            </div>
            <CognitiveResponse text={agentResponse.response} />
            {agentResponse.messageId && (
              <FeedbackButtons
                agentCode={agentResponse.code}
                messageId={agentResponse.messageId}
                conversationId={agentResponse.conversationId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
