"use client";

import { useState } from "react";
import { updateCustomerAction } from "@/actions/customer.actions";
import { Edit3 } from "lucide-react";

type Customer = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  notes: string | null;
};

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await updateCustomerAction({
      id: customer.id,
      fullName: fd.get("fullName") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      addressLine1: fd.get("addressLine1") as string,
      addressLine2: fd.get("addressLine2") as string,
      city: fd.get("city") as string,
      postalCode: fd.get("postalCode") as string,
      province: fd.get("province") as string,
      notes: fd.get("notes") as string,
    });
    setLoading(false);
    if (result.success) {
      setEditing(false);
    } else {
      setError(result.error || "Error");
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 rounded-lg border border-[#1a2d4a] px-3 py-2 text-xs text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors w-full justify-center"
      >
        <Edit3 size={12} /> Editar datos
      </button>
    );
  }

  const inputCls = "w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-cyan-500/20 bg-[#0a1628]/80 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Editar cliente</h3>
      <div className="space-y-2">
        <input name="fullName" defaultValue={customer.fullName} placeholder="Nombre *" required className={inputCls} />
        <input name="phone" defaultValue={customer.phone || ""} placeholder="Telefono" className={inputCls} />
        <input name="email" defaultValue={customer.email || ""} placeholder="Email" className={inputCls} />
        <input name="addressLine1" defaultValue={customer.addressLine1} placeholder="Direccion *" required className={inputCls} />
        <input name="addressLine2" defaultValue={customer.addressLine2 || ""} placeholder="Direccion linea 2" className={inputCls} />
        <div className="grid grid-cols-2 gap-2">
          <input name="postalCode" defaultValue={customer.postalCode || ""} placeholder="CP" className={inputCls} />
          <input name="city" defaultValue={customer.city || ""} placeholder="Ciudad" className={inputCls} />
        </div>
        <input name="province" defaultValue={customer.province || ""} placeholder="Provincia" className={inputCls} />
        <textarea name="notes" defaultValue={customer.notes || ""} placeholder="Notas" rows={2} className={inputCls} />
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-[#1a2d4a] px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}
