"use client";

import { useState, useRef } from "react";
import { Brain, FileText, Camera, AlertTriangle, Loader2, Sparkles, Upload } from "lucide-react";

export function AIPanel() {
  const [tab, setTab] = useState<"report" | "alerts" | "extract">("report");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [extractResult, setExtractResult] = useState<Record<string, unknown> | null>(null);
  const [extractRaw, setExtractRaw] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadReport() {
    setLoading(true);
    setReport("");
    try {
      const res = await fetch("/api/agent/report");
      const data = await res.json();
      setReport(data.report || data.error || "Sin respuesta");
    } catch { setReport("Error de conexion"); }
    setLoading(false);
  }

  async function loadAlerts() {
    setLoading(true);
    setAlerts([]);
    try {
      const res = await fetch("/api/agent/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch { setAlerts(["Error al cargar alertas"]); }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Maximo 5MB"); return; }

    setLoading(true);
    setExtractResult(null);
    setExtractRaw("");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      try {
        const res = await fetch("/api/agent/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, fileName: file.name }),
        });
        const data = await res.json();
        setExtractResult(data.data);
        setExtractRaw(data.raw || "");
      } catch { setExtractRaw("Error al procesar"); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  const tabs = [
    { key: "report" as const, label: "Informe IA", icon: <Brain size={14} /> },
    { key: "alerts" as const, label: "Alertas IA", icon: <AlertTriangle size={14} /> },
    { key: "extract" as const, label: "Extraer datos", icon: <FileText size={14} /> },
  ];

  return (
    <div className="mt-6 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tab === t.key
                ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                : "bg-[#0a1628] border border-[#1a2d4a] text-slate-500 hover:text-slate-300"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* REPORT TAB */}
      {tab === "report" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-300">Informe diario generado por IA</h2>
            </div>
            <button onClick={loadReport} disabled={loading}
              className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Generar informe"}
            </button>
          </div>
          {report ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{report}</pre>
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-8">Pulsa &quot;Generar informe&quot; para que la IA analice tu negocio</p>
          )}
        </div>
      )}

      {/* ALERTS TAB */}
      {tab === "alerts" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-400" />
              <h2 className="text-sm font-bold text-slate-300">Alertas proactivas</h2>
            </div>
            <button onClick={loadAlerts} disabled={loading}
              className="rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Analizar anomalias"}
            </button>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-orange-500/5 border border-orange-500/15 px-4 py-3">
                  <AlertTriangle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{a}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-8">Pulsa &quot;Analizar anomalias&quot; para que la IA detecte problemas</p>
          )}
        </div>
      )}

      {/* EXTRACT TAB */}
      {tab === "extract" && (
        <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold text-slate-300">Extraer datos de documento</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Sube una factura PDF, un albaran o una foto de producto dañado. La IA extraera los datos automaticamente.</p>

          <div className="flex gap-3 mb-6">
            <button onClick={() => fileRef.current?.click()} disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-4 py-3 text-sm font-bold text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Subir archivo
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm font-bold text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors">
              <Camera size={16} />
              Foto movil
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" capture="environment" onChange={handleFileUpload} className="hidden" />

          {extractResult && (
            <div className="rounded-xl bg-[#050a14] border border-[#1a2d4a] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Datos extraidos</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(extractResult).map(([key, val]) => {
                  if (val === null || val === undefined || val === "") return null;
                  return (
                    <div key={key} className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2">
                      <p className="text-[9px] font-bold uppercase text-cyan-500/40">{key}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{typeof val === "object" ? JSON.stringify(val) : String(val)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {extractRaw && !extractResult && (
            <pre className="rounded-xl bg-[#050a14] border border-[#1a2d4a] p-4 text-xs text-slate-400 whitespace-pre-wrap">{extractRaw}</pre>
          )}
        </div>
      )}
    </div>
  );
}
