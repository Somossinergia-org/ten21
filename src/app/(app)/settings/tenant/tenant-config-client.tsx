"use client";

import { useState } from "react";
import { saveTenantConfigAction } from "@/actions/tenant-config.actions";

type Config = { businessName: string; tradeName: string | null; taxId: string | null; phone: string | null; email: string | null; address: string | null; city: string | null; province: string | null; postalCode: string | null; country: string; timezone: string; currency: string; language: string } | null;

export function TenantConfigClient({ config }: { config: Config }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(""); setSaved(false);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { data[k] = v; });
    const result = await saveTenantConfigAction(data);
    setLoading(false);
    if (result.success) setSaved(true);
    else setError(result.error || "Error");
  }

  const inputCls = "w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-xs text-slate-500 block mb-1">Razon social *</label><input name="businessName" defaultValue={config?.businessName || ""} required className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Nombre comercial</label><input name="tradeName" defaultValue={config?.tradeName || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">CIF/NIF</label><input name="taxId" defaultValue={config?.taxId || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Telefono</label><input name="phone" defaultValue={config?.phone || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Email</label><input name="email" defaultValue={config?.email || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Direccion</label><input name="address" defaultValue={config?.address || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Ciudad</label><input name="city" defaultValue={config?.city || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Provincia</label><input name="province" defaultValue={config?.province || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">CP</label><input name="postalCode" defaultValue={config?.postalCode || ""} className={inputCls} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Pais</label><input name="country" defaultValue={config?.country || "ES"} className={inputCls} /></div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved && <p className="text-xs text-emerald-400">Configuracion guardada</p>}
      <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
