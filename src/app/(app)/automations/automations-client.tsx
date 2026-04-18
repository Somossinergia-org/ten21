"use client";

import { useState } from "react";
import { toggleAutomationRuleAction, retryOutboundAction, cancelOutboundAction, processQueueAction } from "@/actions/automation.actions";
import { Zap, Mail, MessageSquare, Bell, Play, XCircle, RefreshCw } from "lucide-react";

type Rule = { id: string; code: string; eventType: string; channel: string; target: string; enabled: boolean; template: { code: string; subject: string | null } | null };
type Template = { id: string; code: string; channel: string; eventType: string; subject: string | null };
type Message = { id: string; channel: string; destination: string; eventType: string; status: string; attempts: number; lastError: string | null; sentAt: Date | null; createdAt: Date };

const channelIcons: Record<string, React.ReactNode> = {
  EMAIL: <Mail size={12} />, PUSH: <Bell size={12} />, WHATSAPP: <MessageSquare size={12} />, INTERNAL: <Bell size={12} />,
};

const statusColors: Record<string, string> = {
  QUEUED: "bg-blue-500/10 text-blue-400",
  PROCESSING: "bg-amber-500/10 text-amber-400",
  SENT: "bg-emerald-500/10 text-emerald-400",
  FAILED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-slate-500/10 text-slate-500",
};

export function AutomationsClient({ rules, templates, messages }: { rules: Rule[]; templates: Template[]; messages: Message[] }) {
  const [tab, setTab] = useState<"rules" | "templates" | "queue">("rules");
  const [processing, setProcessing] = useState(false);

  const queuedCount = messages.filter((m) => m.status === "QUEUED").length;
  const failedCount = messages.filter((m) => m.status === "FAILED").length;

  async function handleProcess() {
    setProcessing(true);
    await processQueueAction();
    setProcessing(false);
  }

  return (
    <div className="mt-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["rules", "templates", "queue"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}>
            {t === "rules" ? `Reglas (${rules.length})` : t === "templates" ? `Plantillas (${templates.length})` : `Cola (${queuedCount} / ${failedCount} fallidos)`}
          </button>
        ))}
      </div>

      {/* Rules tab */}
      {tab === "rules" && (
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Sin reglas configuradas</p>
          ) : rules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3">
              <Zap size={14} className={r.enabled ? "text-cyan-400" : "text-slate-600"} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{r.code}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">{channelIcons[r.channel]} {r.channel}</span>
                  <span className="text-[10px] text-slate-600">{r.eventType}</span>
                </div>
                <p className="text-xs text-slate-500">→ {r.target}{r.template ? ` (${r.template.code})` : ""}</p>
              </div>
              <button onClick={() => toggleAutomationRuleAction(r.id)}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${r.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>
                {r.enabled ? "Activa" : "Pausada"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Templates tab */}
      {tab === "templates" && (
        <div className="space-y-2">
          {templates.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Sin plantillas</p>
          ) : templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">{t.code}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">{channelIcons[t.channel]} {t.channel}</span>
                <span className="text-[10px] text-slate-600">{t.eventType}</span>
              </div>
              {t.subject && <p className="text-xs text-slate-400 mt-1">{t.subject}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Queue tab */}
      {tab === "queue" && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={handleProcess} disabled={processing || queuedCount === 0}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
              <Play size={14} /> {processing ? "Procesando..." : "Procesar cola"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Destino</th>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Intentos</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2d4a]">
                {messages.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">Sin mensajes</td></tr>
                ) : messages.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 flex items-center gap-1 text-slate-400">{channelIcons[m.channel]} {m.channel}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[150px] truncate">{m.destination}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.eventType}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[m.status]}`}>{m.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{m.attempts}</td>
                    <td className="px-4 py-3 flex gap-1">
                      {m.status === "FAILED" && (
                        <button onClick={() => retryOutboundAction(m.id)} className="text-cyan-400 hover:text-cyan-300"><RefreshCw size={12} /></button>
                      )}
                      {["QUEUED", "FAILED"].includes(m.status) && (
                        <button onClick={() => cancelOutboundAction(m.id)} className="text-red-400 hover:text-red-300"><XCircle size={12} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
