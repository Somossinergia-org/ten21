"use client";

import { CheckCircle2, Search, Zap } from "lucide-react";
import { parseCognitive, hasCognitiveStructure } from "@/lib/ai/cognitive-parser";

type Props = { text: string };

export function CognitiveResponse({ text }: Props) {
  const { facts, inferences, recommendations, other } = parseCognitive(text);
  const structured = hasCognitiveStructure(text);

  if (!structured && !other) {
    return <p className="text-sm text-slate-400 whitespace-pre-wrap">{text}</p>;
  }

  if (!structured) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{other}</p>
        <p className="text-[9px] text-amber-500/60 italic">⚠ Respuesta sin formato cognitivo</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {other && (
        <p className="text-[12px] text-slate-400 italic leading-relaxed">{other}</p>
      )}

      {facts.length > 0 && (
        <section
          role="region"
          aria-label="Hechos"
          className="rounded-lg border border-[#1a2d4a] border-l-2 border-l-cyan-500/70 bg-[#050a14]/50 px-3 py-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={11} className="text-cyan-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Hechos</span>
          </div>
          <ul className="space-y-1">
            {facts.map((f, i) => (
              <li key={i} className="text-[12px] text-slate-200 leading-snug">{f}</li>
            ))}
          </ul>
        </section>
      )}

      {inferences.length > 0 && (
        <section
          role="region"
          aria-label="Inferencias"
          className="rounded-lg border border-[#1a2d4a] border-l-2 border-l-amber-500/70 bg-[#050a14]/50 px-3 py-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Search size={11} className="text-amber-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Inferencias</span>
          </div>
          <ul className="space-y-1">
            {inferences.map((f, i) => (
              <li key={i} className="text-[12px] text-slate-200 leading-snug">{f}</li>
            ))}
          </ul>
        </section>
      )}

      {recommendations.length > 0 && (
        <section
          role="region"
          aria-label="Recomendaciones"
          className="rounded-lg border border-[#1a2d4a] border-l-2 border-l-emerald-500/70 bg-[#050a14]/50 px-3 py-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Recomendaciones</span>
          </div>
          <ul className="space-y-1">
            {recommendations.map((f, i) => (
              <li key={i} className="text-[12px] text-slate-200 leading-snug">{f}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
