"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { acknowledgeInsight, dismissInsight } from "@/actions/ai-insights.actions";

type Insight = {
  id: string;
  severity: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  agent: { code: string; name: string };
};

const severityTokens: Record<string, { border: string; label: string; labelColor: string }> = {
  AI_INFO: { border: "border-l-blue-500", label: "Info", labelColor: "text-blue-400" },
  AI_WARNING: { border: "border-l-amber-500", label: "Atención", labelColor: "text-amber-400" },
  AI_HIGH: { border: "border-l-red-400", label: "Alto", labelColor: "text-red-400" },
  AI_CRITICAL: { border: "border-l-red-600", label: "Crítico", labelColor: "text-red-500" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const token = severityTokens[insight.severity] || severityTokens.AI_INFO;
  const [isPending, start] = useTransition();
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  function ack() {
    start(async () => {
      const res = await acknowledgeInsight(insight.id);
      if (res.success) setHidden(true);
    });
  }
  function dismiss() {
    start(async () => {
      const res = await dismissInsight(insight.id);
      if (res.success) setHidden(true);
    });
  }

  return (
    <div className={`rounded-lg border-l-2 ${token.border} border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase ${token.labelColor}`}>{token.label}</span>
          <p className="text-sm font-medium text-slate-200">{insight.title}</p>
        </div>
        <span className="text-[9px] text-cyan-500 font-mono">{insight.agent.name}</span>
      </div>
      <p className="text-xs text-slate-400 whitespace-pre-wrap">{insight.summary}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] text-slate-600">{insight.category}</span>
        <div className="flex items-center gap-1">
          {insight.status !== "ACKNOWLEDGED" && (
            <button
              onClick={ack}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-40"
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
              Reconocer
            </button>
          )}
          <button
            onClick={dismiss}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md border border-slate-500/20 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-slate-500/10 disabled:opacity-40"
          >
            {isPending ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
