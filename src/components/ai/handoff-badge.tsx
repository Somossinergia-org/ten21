import { ArrowRight } from "lucide-react";

type Handoff = {
  id: string;
  reason: string;
  urgency: string;
  fromAgent: { code: string; name: string };
  toAgent: { code: string; name: string };
};

const urgencyColor: Record<string, string> = {
  HANDOFF_LOW: "border-slate-500/20 text-slate-400",
  HANDOFF_NORMAL: "border-cyan-500/20 text-cyan-400",
  HANDOFF_HIGH: "border-amber-500/30 text-amber-400",
  HANDOFF_URGENT: "border-red-500/40 text-red-400",
};

export function HandoffBadge({ handoff }: { handoff: Handoff }) {
  const color = urgencyColor[handoff.urgency] || urgencyColor.HANDOFF_NORMAL;
  return (
    <div className={`inline-flex items-center gap-2 rounded-md border bg-[#050a14]/60 px-2 py-1 ${color}`}>
      <span className="text-[10px] font-mono">{handoff.fromAgent.name}</span>
      <ArrowRight size={10} />
      <span className="text-[10px] font-mono">{handoff.toAgent.name}</span>
      <span className="text-[9px] text-slate-500 truncate max-w-[180px]">· {handoff.reason}</span>
    </div>
  );
}
