import type { ReactNode } from "react";
import { StatusChip } from "./status-chip";

type KanbanColumnProps = {
  status: string;
  count: number;
  children: ReactNode;
};

export function KanbanColumn({ status, count, children }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[240px] max-w-[320px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <StatusChip status={status} />
        <span className="text-[10px] text-slate-600 font-mono">{count}</span>
      </div>
      <div className="space-y-2 min-h-[100px]">
        {children}
      </div>
    </div>
  );
}

export function KanbanCard({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/80 p-3 hover:bg-white/[0.03] cursor-pointer transition-colors active:scale-[0.99]"
    >
      {children}
    </div>
  );
}
