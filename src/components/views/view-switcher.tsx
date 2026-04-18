"use client";

import { LayoutGrid, List, Columns } from "lucide-react";

export type ViewMode = "cards" | "table" | "kanban";

const icons: Record<ViewMode, React.ReactNode> = {
  cards: <LayoutGrid size={14} />,
  table: <List size={14} />,
  kanban: <Columns size={14} />,
};

export function ViewSwitcher({
  current,
  options,
  onChange,
}: {
  current: ViewMode;
  options: ViewMode[];
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-[#1a2d4a] overflow-hidden">
      {options.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            current === mode
              ? "bg-cyan-500/10 text-cyan-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
          }`}
        >
          {icons[mode]}
        </button>
      ))}
    </div>
  );
}
