"use client";

import { useState } from "react";
import { createMissionAction, executeMissionAction, confirmStepAction } from "@/actions/mission.actions";
import { Send, Play, CheckCircle, XCircle, Clock, AlertTriangle, Zap } from "lucide-react";

type Step = {
  id: string; stepOrder: number; agentCode: string; actionCode: string;
  description: string; status: string; riskLevel: string; requiresConfirm: boolean;
  dryRunResultJson: unknown; executeResultJson: unknown; errorMessage: string | null;
};

type Mission = {
  id: string; orderText: string; status: string; parsedIntent: string | null;
  totalSteps: number; completedSteps: number; failedSteps: number;
  summaryJson: unknown; createdAt: Date; steps: Step[];
};

const missionStatusColors: Record<string, string> = {
  DRAFT_MISSION: "text-slate-400", PLANNING: "text-blue-400",
  PLANNED: "text-cyan-400", EXECUTING: "text-amber-400",
  COMPLETED_MISSION: "text-emerald-400", FAILED_MISSION: "text-red-400",
  CANCELLED_MISSION: "text-slate-500",
};

const stepStatusIcons: Record<string, React.ReactNode> = {
  PENDING_STEP: <Clock size={12} className="text-slate-500" />,
  DRY_RUN_STEP: <Zap size={12} className="text-blue-400" />,
  DRY_RUN_DONE: <Zap size={12} className="text-cyan-400" />,
  PENDING_CONFIRMATION: <AlertTriangle size={12} className="text-amber-400" />,
  EXECUTING_STEP: <Zap size={12} className="text-amber-400" />,
  COMPLETED_STEP: <CheckCircle size={12} className="text-emerald-400" />,
  FAILED_STEP: <XCircle size={12} className="text-red-400" />,
  SKIPPED_STEP: <XCircle size={12} className="text-slate-500" />,
  DENIED_STEP: <XCircle size={12} className="text-red-500" />,
};

export function MissionsClient({ missions }: { missions: Mission[] }) {
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!order.trim()) return;
    setLoading(true); setError("");
    const result = await createMissionAction(order);
    setLoading(false);
    if (result.success) setOrder("");
    else setError(result.error || "Error");
  }

  async function handleExecute(missionId: string) {
    setLoading(true);
    await executeMissionAction(missionId);
    setLoading(false);
  }

  const inputCls = "flex-1 rounded-lg border border-[#1a2d4a] bg-[#050a14] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <div className="mt-4 space-y-6">
      {/* Order input */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#0a1628]/90 p-4">
        <p className="text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">Nueva orden</p>
        <div className="flex gap-2">
          <input value={order} onChange={(e) => setOrder(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder='Ej: "Reintenta webhooks fallidos y deja informe"'
            className={inputCls} />
          <button onClick={handleCreate} disabled={loading || !order.trim()}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700 disabled:opacity-50">
            {loading ? "..." : <Send size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Missions list */}
      <div className="space-y-4">
        {missions.length === 0 ? (
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-12 text-center">
            <Zap size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">Sin misiones. Escribe una orden para empezar.</p>
          </div>
        ) : missions.map((m) => (
          <div key={m.id} className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-slate-200 font-medium">&quot;{m.orderText}&quot;</p>
                {m.parsedIntent && <p className="text-xs text-slate-500 mt-0.5">{m.parsedIntent}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${missionStatusColors[m.status]}`}>{m.status.replace("_MISSION", "")}</span>
                {m.status === "PLANNED" && (
                  <button onClick={() => handleExecute(m.id)} disabled={loading}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1 text-xs text-white hover:bg-cyan-700 disabled:opacity-50">
                    <Play size={10} /> Ejecutar
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3">
              <span>{m.totalSteps} pasos</span>
              <span className="text-emerald-400">{m.completedSteps} completados</span>
              {m.failedSteps > 0 && <span className="text-red-400">{m.failedSteps} fallidos</span>}
              <span>{new Date(m.createdAt).toLocaleString("es-ES")}</span>
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
              {m.steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg border border-[#1a2d4a] px-3 py-2">
                  {stepStatusIcons[s.status] || <Clock size={12} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-cyan-500">{s.agentCode}</span>
                      <span className="text-[10px] text-slate-600">→</span>
                      <span className="text-[10px] font-mono text-slate-400">{s.actionCode}</span>
                      <span className={`text-[9px] px-1 rounded ${s.riskLevel === "LOW" ? "bg-emerald-500/10 text-emerald-400" : s.riskLevel === "MEDIUM" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{s.riskLevel}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{s.description}</p>
                    {s.errorMessage && <p className="text-[10px] text-red-400 mt-0.5">{s.errorMessage}</p>}
                  </div>
                  {s.status === "PENDING_CONFIRMATION" && (
                    <button onClick={() => confirmStepAction(s.id)}
                      className="flex items-center gap-1 rounded bg-amber-600 px-2 py-1 text-[10px] text-white hover:bg-amber-700">
                      <CheckCircle size={10} /> Confirmar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
