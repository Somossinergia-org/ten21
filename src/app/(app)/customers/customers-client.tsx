"use client";

import Link from "next/link";
import { useState } from "react";
import { createCustomerAction, toggleCustomerActiveAction } from "@/actions/customer.actions";
import { UserCircle, Plus, MapPin, Phone, X } from "lucide-react";

type Customer = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  addressLine1: string;
  city: string | null;
  active: boolean;
  _count: { deliveries: number };
};

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = customers.filter((c) => {
    if (!showInactive && !c.active) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.addressLine1.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await createCustomerAction({
      fullName: fd.get("fullName") as string,
      phone: fd.get("phone") as string,
      addressLine1: fd.get("addressLine1") as string,
      city: fd.get("city") as string,
      province: fd.get("province") as string,
      postalCode: fd.get("postalCode") as string,
      notes: fd.get("notes") as string,
    });
    setLoading(false);
    if (result.success) {
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Error");
    }
  }

  return (
    <div className="mt-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-[#1a2d4a] bg-[#0a1628] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded" />
          Inactivos
        </label>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancelar" : "Nuevo cliente"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input name="fullName" placeholder="Nombre completo *" required className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
            <input name="phone" placeholder="Telefono" className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
            <input name="addressLine1" placeholder="Direccion *" required className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
            <input name="city" placeholder="Ciudad" className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
            <input name="postalCode" placeholder="Codigo postal" className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
            <input name="province" placeholder="Provincia" className="rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
          </div>
          <textarea name="notes" placeholder="Notas" rows={2} className="mt-3 w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors">
            {loading ? "Guardando..." : "Crear cliente"}
          </button>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 hidden sm:table-cell">Telefono</th>
              <th className="px-4 py-3 hidden md:table-cell">Direccion</th>
              <th className="px-4 py-3 hidden lg:table-cell">Ciudad</th>
              <th className="px-4 py-3 text-center">Entregas</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  {search ? "Sin resultados" : "No hay clientes registrados"}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/customers/${c.id}`} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium">
                      <UserCircle size={16} className="text-slate-600" />
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-400">
                    {c.phone ? (
                      <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-400 max-w-[250px] truncate">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {c.addressLine1}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
                      {c._count.deliveries}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCustomerActiveAction(c.id)}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {c.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-600">{filtered.length} clientes</p>
    </div>
  );
}
