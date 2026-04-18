"use client";

import Link from "next/link";
import { useState } from "react";
import { ViewSwitcher, type ViewMode } from "@/components/views/view-switcher";
import { KanbanColumn, KanbanCard } from "@/components/views/kanban-column";
import { StatusChip } from "@/components/views/status-chip";
import { EmptyState } from "@/components/views/empty-state";
import { HeadsetIcon, Plus } from "lucide-react";

type Ticket = {
  id: string;
  ticketNumber: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  customer: { fullName: string };
  assignedTo: { name: string } | null;
  createdAt: Date;
};

const KANBAN_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_SUPPLIER", "RESOLVED", "CLOSED"];
const priorityColors: Record<string, string> = {
  LOW: "text-slate-500", NORMAL: "text-slate-400", HIGH: "text-amber-400", URGENT: "text-red-400",
};
const typeLabels: Record<string, string> = {
  DAMAGE: "Daño", MISSING_ITEM: "Falta pieza", INSTALLATION: "Instalacion",
  WARRANTY: "Garantia", RETURN: "Devolucion", OTHER: "Otro",
};

export function PostSalesViews({ tickets }: { tickets: Ticket[] }) {
  const [view, setView] = useState<ViewMode>("kanban");

  if (tickets.length === 0) {
    return <EmptyState icon={<HeadsetIcon size={28} />} title="Sin tickets de posventa" />;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">{tickets.length} tickets</p>
        <div className="flex items-center gap-2">
          <ViewSwitcher current={view} options={["kanban", "table"]} onChange={setView} />
          <Link href="/post-sales/new" className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">
            <Plus size={12} /> Nuevo
          </Link>
        </div>
      </div>

      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map((status) => {
            const items = tickets.filter((t) => t.status === status);
            return (
              <KanbanColumn key={status} status={status} count={items.length}>
                {items.map((t) => (
                  <Link key={t.id} href={`/post-sales/${t.id}`}>
                    <KanbanCard>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-cyan-400">{t.ticketNumber}</span>
                        <span className={`text-[10px] font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                      </div>
                      <p className="text-sm text-slate-200">{t.customer.fullName}</p>
                      <p className="text-xs text-slate-500 mt-1">{typeLabels[t.type] || t.type}</p>
                    </KanbanCard>
                  </Link>
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      )}

      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-center">Prioridad</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2d4a]">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><Link href={`/post-sales/${t.id}`} className="font-mono text-cyan-400">{t.ticketNumber}</Link></td>
                  <td className="px-4 py-3 text-slate-300">{t.customer.fullName}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{typeLabels[t.type] || t.type}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-center"><StatusChip status={t.status} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
