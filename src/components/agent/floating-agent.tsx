"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, Zap } from "lucide-react";

type Message = { role: "user" | "agent"; text: string };

export function FloatingAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: msg }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "agent", text: data.response || "Sin respuesta" }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Error de conexión. Inténtalo de nuevo." }]);
    }
    setLoading(false);
  }

  async function briefing() {
    setMessages((m) => [...m, { role: "user", text: "Dame el briefing del día" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "briefing" }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "agent", text: data.response }]);
    } catch {
      setMessages((m) => [...m, { role: "agent", text: "Error al generar el briefing." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Bot size={24} className="text-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl bg-[#0a1628] border border-[#1a2d4a] shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2d4a] bg-[#050a14]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Agente TodoMueble</p>
                <p className="text-[10px] text-cyan-500/60">TodoMueble Guardamar — IA</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick actions */}
          {messages.length === 0 && (
            <div className="px-4 py-3 border-b border-[#1a2d4a]/50 space-y-1.5">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Acciones rápidas</p>
              {[
                { icon: <Sparkles size={12} />, label: "Briefing del día", fn: briefing },
                { icon: <Zap size={12} />, label: "¿Cómo está el negocio?", fn: () => send("¿Cómo está el negocio ahora mismo?") },
                { icon: <Zap size={12} />, label: "¿Hay algo urgente?", fn: () => send("¿Hay algo urgente que necesite mi atención?") },
                { icon: <Zap size={12} />, label: "Resumen de incidencias", fn: () => send("Dame un resumen de las incidencias abiertas") },
              ].map((a, i) => (
                <button key={i} onClick={a.fn} disabled={loading}
                  className="w-full flex items-center gap-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-50 text-left">
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-cyan-500/15 text-cyan-100 rounded-br-md"
                    : "bg-[#050a14] border border-[#1a2d4a] text-slate-300 rounded-bl-md"
                }`}>
                  {m.text}
                </div>
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

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3 py-3 border-t border-[#1a2d4a] bg-[#050a14]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta al agente..."
              className="flex-1 bg-[#0a1628] border border-[#1a2d4a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
