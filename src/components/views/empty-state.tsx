import type { ReactNode } from "react";

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-12 text-center">
      {icon && <div className="mb-3 flex justify-center text-slate-600">{icon}</div>}
      <p className="text-sm text-slate-400">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}
    </div>
  );
}
