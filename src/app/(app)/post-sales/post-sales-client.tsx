"use client";

import Link from "next/link";
import { useState } from "react";

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

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400",
  WAITING_SUPPLIER: "bg-purple-500/10 text-purple-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-400",
  CLOSED: "bg-slate-500/10 text-slate-400",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-500",
  NORMAL: "text-slate-400",
  HIGH: "text-amber-400",
  URGENT: "text-red-400",
};

const typeLabels: Record<string, string> = {
  DAMAGE: "Daño", MISSING_ITEM: "Falta pieza", INSTALLATION: "Instalacion",
  WARRANTY: "Garantia", RETURN: "Devolucion", OTHER: "Otro",
};

export function PostSalesClient({ tickets }: { tickets: Ticket[] }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const statuses = ["ALL", "OPEN", "IN_PROGRESS", "WAITING_SUPPLIER", "RESOLVED", "CLOSED"];

  return (
    <div className="mt-4">
      {/* Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}>
            {s === "ALL" ? "Todos" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-center">Prioridad</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Asignado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-600">Sin tickets</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/post-sales/${t.id}`} className="font-mono text-cyan-400 hover:text-cyan-300">{t.ticketNumber}</Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{t.customer.fullName}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{typeLabels[t.type] || t.type}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{t.assignedTo?.name || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
