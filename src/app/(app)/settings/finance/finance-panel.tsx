"use client";

import { useState, useRef } from "react";
import { FileText, Calculator, AlertTriangle, PieChart, Upload, Loader2, Camera, Check } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

type InvoiceData = Record<string, unknown>;

export function FinancePanel() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"upload" | "invoices" | "iva" | "alerts" | "summary">("upload");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [extractResult, setExtractResult] = useState<InvoiceData | null>(null);
  const [saving, setSaving] = useState(false);

  // Data states
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [iva, setIva] = useState<InvoiceData | null>(null);
  const [alerts, setAlerts] = useState<InvoiceData[]>([]);
  const [summary, setSummary] = useState<InvoiceData | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setLoading(true);
    setExtractResult(null);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const res = await fetch("/api/agent/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: evt.target?.result, fileName: file.name }),
        });
        const data = await res.json();
        setExtractResult(data.data);
      } catch { toast("Error al procesar", "error"); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveInvoice() {
    if (!extractResult) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-from-extraction", data: extractResult }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Factura guardada");
        setExtractResult(null);
      }
    } catch { toast("Error al guardar", "error"); }
    setSaving(false);
  }

  async function loadInvoices() { setLoading(true); const r = await fetch("/api/finance?action=invoices"); const d = await r.json(); setInvoices(d.invoices || []); setLoading(false); }
  async function loadIva() { setLoading(true); const r = await fetch("/api/finance?action=iva"); setIva(await r.json()); setLoading(false); }
  async function loadAlerts() { setLoading(true); const r = await fetch("/api/finance?action=alerts"); const d = await r.json(); setAlerts(d.alerts || []); setLoading(false); }
  async function loadSummary() { setLoading(true); const r = await fetch("/api/finance?action=summary"); setSummary(await r.json()); setLoading(false); }

  const tabs = [
    { key: "upload" as const, label: "Subir factura", icon: <Upload size={13} /> },
    { key: "invoices" as const, label: "Facturas", icon: <FileText size={13} />, load: loadInvoices },
    { key: "iva" as const, label: "IVA trimestral", icon: <Calculator size={13} />, load: loadIva },
    { key: "alerts" as const, label: "Alertas pago", icon: <AlertTriangle size={13} />, load: loadAlerts },
    { key: "summary" as const, label: "Resumen gastos", icon: <PieChart size={13} />, load: loadSummary },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); t.load?.(); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab === t.key ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400" : "bg-[#0a1628] border border-[#1a2d4a] text-slate-500 hover:text-slate-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* UPLOAD */}
      {tab === "upload" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-2">Subir factura de proveedor</h2>
          <p className="text-xs text-slate-500 mb-4">La IA extrae automaticamente: numero, proveedor, importes, IVA, fecha, vencimiento</p>
          <div className="flex gap-3 mb-4">
            <button onClick={() => fileRef.current?.click()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-4 py-3 text-sm font-bold text-purple-400 hover:bg-purple-500/20 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Subir PDF
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm font-bold text-green-400 hover:bg-green-500/20 disabled:opacity-50">
              <Camera size={16} /> Foto
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" capture="environment" onChange={handleUpload} className="hidden" />
          {extractResult && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#050a14] border border-[#1a2d4a] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Datos extraidos por IA</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(extractResult).filter(([,v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2">
                      <p className="text-[9px] font-bold uppercase text-cyan-500/40">{k}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{typeof v === "object" ? JSON.stringify(v) : String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={saveInvoice} disabled={saving} className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Guardar factura
              </button>
            </div>
          )}
        </div>
      )}

      {/* INVOICES */}
      {tab === "invoices" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4">Facturas registradas</h2>
          {loading ? <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto" /> : invoices.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-6">Sin facturas. Sube la primera desde la pestaña &quot;Subir factura&quot;.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: InvoiceData, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-[#050a14] border border-[#1a2d4a]/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-300">{String(inv.supplierName || "Sin proveedor")}</p>
                    <p className="text-xs text-slate-500">{String(inv.invoiceNumber || "Sin numero")} — {String(inv.concept || "")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-cyan-400">{Number(inv.totalAmount || 0).toFixed(2)} €</p>
                    <p className="text-[10px] text-slate-600">{String(inv.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IVA */}
      {tab === "iva" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4">IVA soportado — Trimestre actual</h2>
          {loading ? <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto" /> : !iva ? (
            <p className="text-xs text-slate-600 text-center py-6">Cargando...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#050a14] border border-[#1a2d4a] p-4 text-center">
                  <p className="text-2xl font-black font-mono text-slate-300">{Number(iva.totalBase || 0).toFixed(2)} €</p>
                  <p className="text-[10px] text-slate-500 uppercase">Base imponible</p>
                </div>
                <div className="rounded-xl bg-[#050a14] border border-orange-500/20 p-4 text-center">
                  <p className="text-2xl font-black font-mono text-orange-400">{Number(iva.totalTax || 0).toFixed(2)} €</p>
                  <p className="text-[10px] text-slate-500 uppercase">IVA soportado</p>
                </div>
                <div className="rounded-xl bg-[#050a14] border border-cyan-500/20 p-4 text-center">
                  <p className="text-2xl font-black font-mono text-cyan-400">{Number(iva.totalAmount || 0).toFixed(2)} €</p>
                  <p className="text-[10px] text-slate-500 uppercase">Total</p>
                </div>
              </div>
              {(iva as InvoiceData & { byMonth?: { month: string; base: number; tax: number; count: number }[] }).byMonth && (
                <div className="space-y-1">
                  {((iva as InvoiceData & { byMonth: { month: string; base: number; tax: number; total: number; count: number }[] }).byMonth).map((m) => (
                    <div key={m.month} className="flex items-center justify-between rounded-lg bg-[#050a14] border border-[#1a2d4a]/30 px-4 py-2">
                      <span className="text-xs text-slate-400 capitalize">{m.month}</span>
                      <div className="flex gap-4 text-xs font-mono">
                        <span className="text-slate-500">Base: {m.base.toFixed(2)} €</span>
                        <span className="text-orange-400">IVA: {m.tax.toFixed(2)} €</span>
                        <span className="text-slate-300">{m.count} fact.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ALERTS */}
      {tab === "alerts" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4">Alertas de vencimiento</h2>
          {loading ? <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto" /> : alerts.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-6">Sin alertas de vencimiento</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  a.severity === "high" ? "bg-red-500/5 border border-red-500/20" : "bg-orange-500/5 border border-orange-500/20"
                }`}>
                  <AlertTriangle size={14} className={a.severity === "high" ? "text-red-400" : "text-orange-400"} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">{String(a.supplier)} — {String(a.invoice)}</p>
                    <p className="text-xs text-slate-500">
                      {a.type === "overdue" ? `Vencida hace ${a.daysOverdue} dias` : a.type === "due_soon" ? `Vence el ${a.dueDate}` : "Importe no cuadra"}
                    </p>
                  </div>
                  <p className="text-sm font-mono font-bold text-red-400">{Number(a.amount || 0).toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUMMARY */}
      {tab === "summary" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4">Resumen de gastos por proveedor</h2>
          {loading ? <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto" /> : !summary ? (
            <p className="text-xs text-slate-600 text-center py-6">Cargando...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total facturas", value: summary.totalInvoices, color: "text-slate-300" },
                  { label: "Gasto total", value: `${Number(summary.totalAmount || 0).toFixed(2)} €`, color: "text-cyan-400" },
                  { label: "Pendientes", value: summary.totalPending, color: "text-orange-400" },
                  { label: "Pagadas", value: summary.totalPaid, color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-[#050a14] border border-[#1a2d4a] p-3 text-center">
                    <p className={`text-xl font-black font-mono ${s.color}`}>{String(s.value)}</p>
                    <p className="text-[9px] text-slate-500 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
              {(summary as InvoiceData & { bySupplier?: { name: string; count: number; total: number }[] }).bySupplier?.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg bg-[#050a14] border border-[#1a2d4a]/30 px-4 py-2">
                  <div>
                    <p className="text-sm text-slate-300">{s.name}</p>
                    <p className="text-[10px] text-slate-600">{s.count} facturas</p>
                  </div>
                  <p className="text-sm font-mono font-bold text-cyan-400">{s.total.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
