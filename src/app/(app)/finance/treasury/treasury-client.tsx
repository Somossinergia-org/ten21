"use client";

import { useState } from "react";
import { createManualTreasuryAction, markTreasuryPaidAction } from "@/actions/treasury.actions";
import { TrendingUp, TrendingDown, AlertTriangle, Plus, CheckCircle } from "lucide-react";

type Forecast = { days: number; income: number; expense: number; balance: number };
type Summary = { overdue: { income: number; expense: number; net: number }; upcoming7: { income: number; expense: number; net: number }; paidLast30: { income: number; expense: number; net: number } };
type Entry = { id: string; type: string; concept: string; amount: unknown; dueDate: Date | null; paidDate: Date | null; status: string; sourceType: string | null; category: string | null };

function money(v: number) { return v.toFixed(2) + " €"; }

export function TreasuryClient({ entries, forecast7, forecast30, forecast60, summary }: {
  entries: Entry[]; forecast7: Forecast; forecast30: Forecast; forecast60: Forecast; summary: Summary;
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const result = await createManualTreasuryAction({
      type: fd.get("type") as string,
      concept: fd.get("concept") as string,
      amount: parseFloat(fd.get("amount") as string),
      dueDate: (fd.get("dueDate") as string) || undefined,
      category: (fd.get("category") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    });
    setLoading(false);
    if (result.success) { setShowForm(false); (e.target as HTMLFormElement).reset(); }
    else setError(result.error || "Error");
  }

  const inputCls = "w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <div className="mt-4 space-y-6">
      {/* Forecast cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[{ f: forecast7, label: "7 dias" }, { f: forecast30, label: "30 dias" }, { f: forecast60, label: "60 dias" }].map(({ f, label }) => (
          <div key={label} className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <p className="text-[10px] text-slate-500 uppercase mb-2">Prevision {label}</p>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-mono font-bold ${f.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {money(f.balance)}
              </span>
            </div>
            <div className="mt-1 flex gap-3 text-xs">
              <span className="text-emerald-500 flex items-center gap-1"><TrendingUp size={10} /> {money(f.income)}</span>
              <span className="text-red-400 flex items-center gap-1"><TrendingDown size={10} /> {money(f.expense)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[10px] text-red-400 uppercase flex items-center gap-1"><AlertTriangle size={10} /> Vencido</p>
          <p className="text-sm text-slate-300 mt-1">Cobrar: <span className="font-mono text-emerald-400">{money(summary.overdue.income)}</span></p>
          <p className="text-sm text-slate-300">Pagar: <span className="font-mono text-red-400">{money(summary.overdue.expense)}</span></p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <p className="text-[10px] text-slate-500 uppercase">Proximo 7 dias</p>
          <p className="text-sm text-slate-300 mt-1">Cobrar: <span className="font-mono text-emerald-400">{money(summary.upcoming7.income)}</span></p>
          <p className="text-sm text-slate-300">Pagar: <span className="font-mono text-red-400">{money(summary.upcoming7.expense)}</span></p>
        </div>
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <p className="text-[10px] text-slate-500 uppercase">Pagado/cobrado 30 dias</p>
          <p className="text-sm text-slate-300 mt-1">Cobrado: <span className="font-mono text-emerald-400">{money(summary.paidLast30.income)}</span></p>
          <p className="text-sm text-slate-300">Pagado: <span className="font-mono text-red-400">{money(summary.paidLast30.expense)}</span></p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700">
          <Plus size={14} /> Entrada manual
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-cyan-500/20 bg-[#0a1628]/80 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select name="type" required className={inputCls}>
            <option value="EXPENSE_EXPECTED">Gasto esperado</option>
            <option value="EXPENSE_CONFIRMED">Gasto confirmado</option>
            <option value="INCOME_EXPECTED">Ingreso esperado</option>
            <option value="INCOME_CONFIRMED">Ingreso confirmado</option>
          </select>
          <input name="concept" placeholder="Concepto *" required className={inputCls} />
          <input name="amount" type="number" step="0.01" min="0.01" placeholder="Importe *" required className={inputCls} />
          <input name="dueDate" type="date" className={inputCls} />
          <input name="category" placeholder="Categoria" className={inputCls} />
          <input name="notes" placeholder="Notas" className={inputCls} />
          {error && <p className="text-xs text-red-400 col-span-full">{error}</p>}
          <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700 disabled:opacity-50">
            {loading ? "Creando..." : "Crear"}
          </button>
        </form>
      )}

      {/* Entries table */}
      <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Importe</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {entries.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">Sin entradas</td></tr>
            ) : entries.map((e) => {
              const isIncome = e.type.startsWith("INCOME");
              const statusColors: Record<string, string> = {
                PENDING: "bg-slate-500/10 text-slate-400",
                UPCOMING: "bg-blue-500/10 text-blue-400",
                PAID: "bg-emerald-500/10 text-emerald-400",
                OVERDUE: "bg-red-500/10 text-red-400",
                CANCELLED: "bg-slate-500/10 text-slate-500",
              };
              return (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-300">{e.concept}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{isIncome ? "Cobro" : "Pago"}</td>
                  <td className={`px-4 py-3 text-right font-mono ${isIncome ? "text-emerald-400" : "text-red-400"}`}>{money(Number(e.amount))}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.dueDate ? new Date(e.dueDate).toLocaleDateString("es-ES") : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[e.status] || ""}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {["PENDING", "UPCOMING", "OVERDUE"].includes(e.status) && (
                      <button onClick={() => markTreasuryPaidAction({ entryId: e.id })}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                        <CheckCircle size={12} /> Pagado
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
