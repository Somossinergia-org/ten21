"use client";

import Link from "next/link";
import { useState } from "react";
import { ViewSwitcher, type ViewMode } from "@/components/views/view-switcher";
import { KanbanColumn, KanbanCard } from "@/components/views/kanban-column";
import { StatusChip } from "@/components/views/status-chip";
import { EmptyState } from "@/components/views/empty-state";
import { Receipt, Plus } from "lucide-react";

type Sale = {
  id: string;
  orderNumber: string;
  status: string;
  total: unknown;
  estimatedMargin: unknown;
  createdAt: Date;
  customer: { fullName: string };
  _count: { lines: number };
};

const KANBAN_STATUSES = ["DRAFT", "CONFIRMED", "PARTIALLY_RESERVED", "RESERVED", "IN_DELIVERY", "DELIVERED"];

export function SalesViews({ sales }: { sales: Sale[] }) {
  const [view, setView] = useState<ViewMode>("kanban");

  if (sales.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState icon={<Receipt size={28} />} title="Sin ventas registradas" description="Crea tu primera venta" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">{sales.length} ventas</p>
        <div className="flex items-center gap-2">
          <ViewSwitcher current={view} options={["kanban", "cards", "table"]} onChange={setView} />
          <Link href="/sales/new" className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">
            <Plus size={12} /> Nueva
          </Link>
        </div>
      </div>

      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map((status) => {
            const items = sales.filter((s) => s.status === status);
            return (
              <KanbanColumn key={status} status={status} count={items.length}>
                {items.map((s) => (
                  <Link key={s.id} href={`/sales/${s.id}`}>
                    <KanbanCard>
                      <p className="font-mono text-xs text-cyan-400 mb-1">{s.orderNumber}</p>
                      <p className="text-sm text-slate-200 font-medium">{s.customer.fullName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">{s._count.lines} lineas</span>
                        <span className="font-mono text-sm text-slate-300">{Number(s.total).toFixed(0)}€</span>
                      </div>
                    </KanbanCard>
                  </Link>
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      )}

      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sales.map((s) => (
            <Link key={s.id} href={`/sales/${s.id}`}
              className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-cyan-400">{s.orderNumber}</span>
                <StatusChip status={s.status} size="xs" />
              </div>
              <p className="text-sm font-medium text-slate-200">{s.customer.fullName}</p>
              <div className="flex justify-between mt-3">
                <span className="text-xs text-slate-500">{s._count.lines} lineas</span>
                <span className="font-mono text-lg font-bold text-slate-200">{Number(s.total).toFixed(0)}€</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Venta</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-center">Lineas</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2d4a]">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><Link href={`/sales/${s.id}`} className="font-mono text-cyan-400 hover:text-cyan-300">{s.orderNumber}</Link></td>
                  <td className="px-4 py-3 text-slate-300">{s.customer.fullName}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{s._count.lines}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">{Number(s.total).toFixed(2)}€</td>
                  <td className="px-4 py-3 text-center"><StatusChip status={s.status} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
