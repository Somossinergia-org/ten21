"use client";

import { useState } from "react";
import { Brain, Send, Lightbulb, Zap } from "lucide-react";

type Insight = { id: string; severity: string; title: string; summary: string; agent: { name: string } };
type Action = { id: string; priority: string; title: string; recommendation: string; agent: { name: string } };

const severityColors: Record<string, string> = {
  AI_INFO: "border-l-blue-500", AI_WARNING: "border-l-amber-500",
  AI_HIGH: "border-l-red-400", AI_CRITICAL: "border-l-red-600",
};

const priorityColors: Record<string, string> = {
  AI_LOW: "text-slate-500", AI_NORMAL: "text-slate-400",
  AI_HIGH: "text-amber-400", AI_URGENT: "text-red-400",
};

export function AgentPanel({
  agentName,
  agentCode,
  insights,
  actions,
  onAsk,
}: {
  agentName: string;
  agentCode: string;
  insights: Insight[];
  actions: Action[];
  onAsk?: (question: string) => Promise<string>;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim() || !onAsk) return;
    setLoading(true);
    setAnswer("");
    const result = await onAsk(question);
    setAnswer(result);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-[#0a1628]/90 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">{agentName}</h3>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {insights.slice(0, 3).map((i) => (
            <div key={i.id} className={`rounded-lg border-l-2 ${severityColors[i.severity] || "border-l-slate-500"} border border-[#1a2d4a] px-3 py-2`}>
              <div className="flex items-center gap-1.5">
                <Lightbulb size={10} className="text-amber-400" />
                <p className="text-xs font-medium text-slate-200">{i.title}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{i.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {actions.slice(0, 2).map((a) => (
            <div key={a.id} className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-cyan-400" />
                <p className="text-xs font-medium text-slate-200">{a.title}</p>
                <span className={`text-[9px] ml-auto ${priorityColors[a.priority]}`}>{a.priority.replace("AI_", "")}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{a.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      {onAsk && (
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder={`Pregunta a ${agentName}...`}
            className="flex-1 rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
          />
          <button onClick={handleAsk} disabled={loading || !question.trim()}
            className="rounded-lg bg-cyan-600 px-2.5 py-1.5 text-xs text-white hover:bg-cyan-700 disabled:opacity-50">
            {loading ? "..." : <Send size={12} />}
          </button>
        </div>
      )}

      {answer && (
        <div className="mt-2 rounded-lg border border-[#1a2d4a] bg-[#050a14]/50 px-3 py-2">
          <p className="text-xs text-slate-300 whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {insights.length === 0 && actions.length === 0 && !answer && (
        <p className="text-[11px] text-slate-600 text-center py-2">Sin insights activos. Haz una pregunta para empezar.</p>
      )}
    </div>
  );
}
