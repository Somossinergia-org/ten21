import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  accent?: "cyan" | "emerald" | "amber" | "red" | "slate";
  href?: string;
};

const accentColors = {
  cyan: "border-cyan-500/20 text-cyan-400",
  emerald: "border-emerald-500/20 text-emerald-400",
  amber: "border-amber-500/20 text-amber-400",
  red: "border-red-500/20 text-red-400",
  slate: "border-[#1a2d4a] text-slate-300",
};

export function KpiCard({ label, value, icon, accent = "slate" }: KpiCardProps) {
  return (
    <div className={`rounded-xl border ${accentColors[accent].split(" ")[0]} bg-[#0a1628]/80 p-4`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-slate-600">{icon}</span>}
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-xl font-mono font-bold ${accentColors[accent].split(" ")[1]}`}>{value}</p>
    </div>
  );
}
