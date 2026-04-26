"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, Zap, ChevronDown } from "lucide-react";
import { CognitiveResponse } from "@/components/ai/cognitive-response";
import { FeedbackButtons } from "@/components/ai/feedback-buttons";

type Message = {
  role: "user" | "agent";
  text: string;
  agentCode?: string;
  messageId?: string;
  conversationId?: string;
};

const AGENTS = [
  { code: "executive", label: "Asistente Ejecutivo", icon: "📊" },
  { code: "sales", label: "Ventas", icon: "💰" },
  { code: "purchase", label: "Compras", icon: "🛒" },
  { code: "warehouse", label: "Almacen", icon: "📦" },
  { code: "delivery", label: "Entregas", icon: "🚛" },
  { code: "treasury", label: "Tesoreria", icon: "🏦" },
];

export function FloatingAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentCode, setAgentCode] = useState("executive");
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const current = AGENTS.find((a) => a.code === agentCode) || AGENTS[0];

  async function send(text?: string, overrideAgent?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const agent = overrideAgent || agentCode;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: msg, agentCode: agent }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        role: "agent",
        text: data.response || "Sin respuesta",
        agentCode: data.agentCode,
        messageId: data.messageId,
        conversationId: data.conversationId,
      }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Error de conexion." }]);
    }
    setLoading(false);
  }

  async function briefing() {
    setMessages((m) => [...m, { role: "user", text: "Briefing del dia" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "briefing" }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        role: "agent",
        text: data.response,
        agentCode: "executive",
        messageId: data.messageId,
        conversationId: data.conversationId,
      }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Error al generar el briefing." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95">
          <Bot size={24} className="text-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] rounded-2xl bg-[#0a1628] border border-[#1a2d4a] shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2d4a] bg-[#050a14]">
            <div className="flex items-center gap-2 relative">
              <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 hover:opacity-80">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">
                  {current.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 flex items-center gap-1">{current.label} <ChevronDown size={10} /></p>
                  <p className="text-[10px] text-cyan-500/60">Agente IA activo</p>
                </div>
              </button>
              {showPicker && (
                <div className="absolute top-12 left-0 z-10 w-48 rounded-lg border border-[#1a2d4a] bg-[#0a1628] shadow-xl p-1">
                  {AGENTS.map((a) => (
                    <button key={a.code} onClick={() => { setAgentCode(a.code); setShowPicker(false); }}
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${a.code === agentCode ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-white/[0.03]"}`}>
                      <span>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
          </div>

          {messages.length === 0 && (
            <div className="px-4 py-3 border-b border-[#1a2d4a]/50 space-y-1.5">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Acciones rapidas</p>
              {[
                { icon: <Sparkles size={12} />, label: "Briefing del dia", fn: briefing },
                { icon: <Zap size={12} />, label: "Estado del negocio", fn: () => send("Como esta el negocio ahora mismo?", "executive") },
                { icon: <Zap size={12} />, label: "Algo urgente?", fn: () => send("Hay algo urgente que necesite atencion?", "executive") },
                { icon: <Zap size={12} />, label: "Estado de ventas", fn: () => send("Como van las ventas?", "sales") },
                { icon: <Zap size={12} />, label: "Tension de caja", fn: () => send("Hay tension de caja?", "treasury") },
              ].map((a, i) => (
                <button key={i} onClick={a.fn} disabled={loading}
                  className="w-full flex items-center gap-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-50 text-left">
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] bg-cyan-500/15 text-cyan-100 rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px] leading-relaxed">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[92%] w-full">
                    {m.agentCode && (
                      <p className="text-[9px] text-cyan-500/50 mb-1 font-mono">{m.agentCode}</p>
                    )}
                    <CognitiveResponse text={m.text} />
                    {m.agentCode && m.messageId && (
                      <FeedbackButtons
                        agentCode={m.agentCode}
                        messageId={m.messageId}
                        conversationId={m.conversationId}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#050a14] border border-[#1a2d4a] rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 size={16} className="text-cyan-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3 py-3 border-t border-[#1a2d4a] bg-[#050a14]">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={`Pregunta a ${current.label}...`}
              className="flex-1 bg-[#0a1628] border border-[#1a2d4a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none"
              disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
