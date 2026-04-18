"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSaleTicketAction } from "@/actions/post-sale-ticket.actions";

type Customer = { id: string; fullName: string };

const types = [
  { value: "DAMAGE", label: "Daño" },
  { value: "MISSING_ITEM", label: "Falta pieza" },
  { value: "INSTALLATION", label: "Instalacion" },
  { value: "WARRANTY", label: "Garantia" },
  { value: "RETURN", label: "Devolucion" },
  { value: "OTHER", label: "Otro" },
];

const priorities = [
  { value: "LOW", label: "Baja" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export function NewPostSaleForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await createPostSaleTicketAction({
      customerId: fd.get("customerId") as string,
      type: fd.get("type") as string,
      priority: fd.get("priority") as string,
      description: fd.get("description") as string,
    });
    setLoading(false);
    if (result.success && result.ticketId) {
      router.push(`/post-sales/${result.ticketId}`);
    } else {
      setError(result.error || "Error");
    }
  }

  const inputCls = "w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-lg">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Cliente *</label>
        <select name="customerId" required className={inputCls}>
          <option value="">Selecciona cliente</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Tipo *</label>
          <select name="type" required className={inputCls}>
            {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Prioridad</label>
          <select name="priority" defaultValue="NORMAL" className={inputCls}>
            {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Descripcion *</label>
        <textarea name="description" required rows={4} placeholder="Describe el problema..." className={inputCls} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
        {loading ? "Creando..." : "Crear ticket"}
      </button>
    </form>
  );
}
