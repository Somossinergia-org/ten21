"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { acceptAction, rejectAction } from "@/actions/ai-insights.actions";

type Action = {
  id: string;
  priority: string;
  title: string;
  recommendation: string;
  rationale: string;
  status: string;
  agent: { code: string; name: string };
};

const priorityTokens: Record<string, { label: string; color: string }> = {
  AI_LOW: { label: "Baja", color: "text-slate-500" },
  AI_NORMAL: { label: "Normal", color: "text-cyan-400" },
  AI_HIGH: { label: "Alta", color: "text-amber-400" },
  AI_URGENT: { label: "Urgente", color: "text-red-400" },
};

export function ActionCard({ action }: { action: Action }) {
  const token = priorityTokens[action.priority] || priorityTokens.AI_NORMAL;
  const [isPending, start] = useTransition();
  const [hidden, setHidden] = useState(false);
  const [accepted, setAccepted] = useState(action.status === "ACCEPTED");

  if (hidden) return null;

  function accept() {
    start(async () => {
      const res = await acceptAction(action.id);
      if (res.success) setAccepted(true);
    });
  }
  function reject() {
    start(async () => {
      const res = await rejectAction(action.id);
      if (res.success) setHidden(true);
    });
  }

  return (
    <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase ${token.color}`}>{token.label}</span>
          <p className="text-sm font-medium text-slate-200">{action.title}</p>
        </div>
        <span className="text-[9px] text-cyan-500 font-mono">{action.agent.name}</span>
      </div>
      <p className="text-xs text-slate-300">{action.recommendation}</p>
      <p className="text-[10px] text-slate-500 mt-1 italic">{action.rationale}</p>
      <div className="flex items-center justify-end gap-1 mt-2">
        {accepted ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
            <Check size={10} /> Aceptada
          </span>
        ) : (
          <button
            onClick={accept}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
          >
            {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
            Aceptar
          </button>
        )}
        <button
          onClick={reject}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-md border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/10 disabled:opacity-40"
        >
          {isPending ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
          Rechazar
        </button>
      </div>
    </div>
  );
}
