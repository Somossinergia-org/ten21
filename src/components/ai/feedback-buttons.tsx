"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, AlertTriangle, Loader2, Check } from "lucide-react";
import { recordFeedbackAction } from "@/actions/ai-feedback.actions";

type SignalType = "USEFUL" | "NOT_USEFUL" | "INCORRECT" | "TOO_GENERIC" | "TOO_TECHNICAL" | "MISSED_RISK";

type Props = {
  agentCode: string;
  messageId?: string;
  conversationId?: string;
};

export function FeedbackButtons({ agentCode, messageId, conversationId }: Props) {
  const [sent, setSent] = useState<SignalType | null>(null);
  const [loading, setLoading] = useState<SignalType | null>(null);
  const [showNotes, setShowNotes] = useState<SignalType | null>(null);
  const [notes, setNotes] = useState("");

  async function send(signal: SignalType, withNotes?: string) {
    if (sent || loading) return;
    setLoading(signal);
    const res = await recordFeedbackAction({
      agentCode,
      signalType: signal,
      messageId,
      conversationId,
      notes: withNotes,
    });
    setLoading(null);
    if (res.success) {
      setSent(signal);
      setShowNotes(null);
      setNotes("");
    }
  }

  function handleClick(signal: SignalType) {
    if (signal === "USEFUL") {
      send(signal);
    } else {
      setShowNotes(signal);
    }
  }

  const baseBtn = "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors disabled:opacity-40";

  if (sent) {
    return (
      <div className="flex items-center gap-1 mt-2 text-[10px] text-cyan-500/60">
        <Check size={11} /> Gracias por tu feedback
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-slate-600">¿Útil?</span>
        <button
          type="button"
          disabled={!!loading}
          aria-pressed={false}
          onClick={() => handleClick("USEFUL")}
          className={`${baseBtn} border-emerald-500/20 text-emerald-400/80 hover:bg-emerald-500/10`}
        >
          {loading === "USEFUL" ? <Loader2 size={10} className="animate-spin" /> : <ThumbsUp size={10} />}
          Útil
        </button>
        <button
          type="button"
          disabled={!!loading}
          aria-pressed={false}
          onClick={() => handleClick("NOT_USEFUL")}
          className={`${baseBtn} border-slate-500/20 text-slate-400 hover:bg-slate-500/10`}
        >
          {loading === "NOT_USEFUL" ? <Loader2 size={10} className="animate-spin" /> : <ThumbsDown size={10} />}
          No útil
        </button>
        <button
          type="button"
          disabled={!!loading}
          aria-pressed={false}
          onClick={() => handleClick("INCORRECT")}
          className={`${baseBtn} border-red-500/20 text-red-400/80 hover:bg-red-500/10`}
        >
          {loading === "INCORRECT" ? <Loader2 size={10} className="animate-spin" /> : <AlertTriangle size={10} />}
          Incorrecto
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => handleClick("TOO_GENERIC")}
          className={`${baseBtn} border-amber-500/20 text-amber-400/80 hover:bg-amber-500/10`}
        >
          Genérico
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => handleClick("TOO_TECHNICAL")}
          className={`${baseBtn} border-amber-500/20 text-amber-400/80 hover:bg-amber-500/10`}
        >
          Técnico
        </button>
      </div>

      {showNotes && (
        <div className="flex items-start gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="¿Qué faltó o falló? (opcional)"
            rows={2}
            className="flex-1 bg-[#050a14] border border-[#1a2d4a] rounded-md px-2 py-1 text-[11px] text-slate-300 placeholder:text-slate-700 focus:border-cyan-500/30 focus:outline-none resize-none"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => send(showNotes, notes || undefined)}
              disabled={!!loading}
              className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-[10px] text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => { setShowNotes(null); setNotes(""); }}
              className="rounded-md border border-slate-500/20 px-2 py-1 text-[10px] text-slate-500 hover:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
