"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell,
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  AlertTriangle, TrendingDown, Phone, FileX, Truck, Package,
  CheckCircle, Shield, Brain, Eye, Zap, Clock,
  ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";

const TOTAL = 10;

export default function PitchPage() {
  const [c, setC] = useState(0);
  const next = () => setC((v) => Math.min(v + 1, TOTAL - 1));
  const prev = () => setC((v) => Math.max(v - 1, 0));

  return (
    <div
      className="h-screen w-screen bg-[#08090d] text-white overflow-hidden select-none relative"
      onClick={next}
      onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === " ") next(); if (e.key === "ArrowLeft") prev(); }}
      tabIndex={0}
    >
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50 bg-white/5">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: `${((c + 1) / TOTAL) * 100}%` }} />
      </div>

      {/* Nav */}
      <div className="absolute bottom-5 right-6 z-50 flex items-center gap-3">
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="text-white/20 hover:text-white/60 transition-colors"><ChevronLeft size={20} /></button>
        <span className="text-white/15 text-xs font-mono tabular-nums">{c + 1}/{TOTAL}</span>
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="text-white/20 hover:text-white/60 transition-colors"><ChevronRight size={20} /></button>
      </div>

      {/* ============================================= */}

      {/* 1 — HOOK */}
      <S active={c === 0}>
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-12 px-10 max-w-6xl mx-auto">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[clamp(1.8rem,4.5vw,4rem)] font-black leading-[1.08]">
              Cada mes tu tienda
              <br />pierde dinero
              <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">y nadie se da cuenta.</span>
            </p>
            <p className="text-white/30 text-lg mt-6 max-w-md">
              Errores de recepción, facturas sin verificar, incidencias olvidadas.
            </p>
          </div>
          <div className="w-72 h-72 relative">
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse" />
            <div className="absolute inset-6 rounded-full bg-red-500/15" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AlertTriangle size={48} className="text-red-400 mb-3" />
              <p className="text-5xl font-black text-red-400">3%</p>
              <p className="text-sm text-red-300/60 mt-1">errores no detectados</p>
              <p className="text-xs text-red-300/40">en cada recepción</p>
            </div>
          </div>
        </div>
      </S>

      {/* 2 — PÉRDIDA DE TIEMPO */}
      <S active={c === 1}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-5xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em] mb-2">Tiempo del jefe</p>
          <p className="text-3xl sm:text-4xl font-black text-center mb-8">¿Dónde se van tus horas?</p>
          <div className="w-full flex gap-8 items-center">
            <div className="flex-1 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Llamar\nalmacén", h: 8 },
                  { name: "Revisar\ndocs", h: 6 },
                  { name: "Comprobar\npedidos", h: 5 },
                  { name: "Reclamar\nproveedor", h: 4 },
                  { name: "Buscar\ninfo", h: 3 },
                ]} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff60", fontSize: 12 }} width={90} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 12, color: "white" }} />
                  <Bar dataKey="h" radius={[0, 8, 8, 0]} name="Horas/sem">
                    {[0,1,2,3,4].map((i) => (
                      <Cell key={i} fill={["#ef4444","#f97316","#eab308","#f59e0b","#ef4444"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-8 py-6 text-center">
                <p className="text-6xl font-black text-red-400">26h</p>
                <p className="text-sm text-red-300/60 mt-2">por semana</p>
                <p className="text-xs text-red-300/40">persiguiendo información</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/20">
                <Clock size={14} />
                <p className="text-xs">En vez de vender</p>
              </div>
            </div>
          </div>
        </div>
      </S>

      {/* 3 — DOCUMENTOS DESCONECTADOS */}
      <S active={c === 2}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-5xl mx-auto">
          <p className="text-3xl sm:text-5xl font-black text-center leading-tight mb-12">
            La información existe.
            <br /><span className="text-orange-400">Pero nadie la conecta.</span>
          </p>
          <div className="flex items-center gap-6 mb-10">
            {[
              { icon: <Package size={28} />, label: "Pedido", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
              { icon: <FileX size={28} />, label: "Albarán", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
              { icon: <FileX size={28} />, label: "Factura", color: "text-green-400 border-green-500/30 bg-green-500/10" },
              { icon: <TrendingDown size={28} />, label: "Banco", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-6">
                {i > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 border-t-2 border-dashed border-red-500/40" />
                    <p className="text-[10px] text-red-400/60">no se cruza</p>
                  </div>
                )}
                <div className={`border rounded-2xl ${doc.color} p-5 flex flex-col items-center gap-2 w-[110px]`}>
                  {doc.icon}
                  <p className="text-sm font-bold">{doc.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-full px-6 py-3">
            <AlertTriangle size={18} className="text-red-400" />
            <p className="text-sm text-red-300">Cada documento va por su lado. Los errores pasan desapercibidos.</p>
          </div>
        </div>
      </S>

      {/* 4 — EJEMPLO IMPACTANTE */}
      <S active={c === 3}>
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-10 px-10 max-w-5xl mx-auto">
          <div className="flex-1">
            <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em] mb-4">Ejemplo real</p>
            <p className="text-4xl font-black leading-tight mb-8">
              3 frigoríficos pedidos.
              <br /><span className="text-red-400">Se pagaron 3.</span>
              <br /><span className="text-red-400">Llegaron 2.</span>
            </p>
            <div className="space-y-3">
              {[
                { icon: <Package size={18} />, text: "1 frigorífico nunca llegó", color: "text-red-400" },
                { icon: <AlertTriangle size={18} />, text: "1 llegó con golpe en lateral", color: "text-orange-400" },
                { icon: <FileX size={18} />, text: "La factura cobró los 3", color: "text-red-400" },
                { icon: <Phone size={18} />, text: "Nadie se dio cuenta a tiempo", color: "text-white/30" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={item.color}>{item.icon}</span>
                  <p className={`text-base font-medium ${item.color}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ v: 2, n: "Llegaron" }, { v: 1, n: "Perdido" }]} dataKey="v" cx="50%" cy="50%" innerRadius={60} outerRadius={90} startAngle={90} endAngle={-270} paddingAngle={4}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 12, color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4">
              <p className="text-xs text-white/30">Pagaste 3 · Recibiste 2</p>
            </div>
          </div>
        </div>
      </S>

      {/* 5 — LA SOLUCIÓN */}
      <S active={c === 4}>
        <div className="flex flex-col items-center justify-center h-full text-center px-10 max-w-4xl mx-auto">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-8">
            <Shield size={36} className="text-white" />
          </div>
          <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-black leading-[1.1]">
            Un sistema que vigila
            <br />cada parte de tu negocio.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: <Eye size={20} />, text: "Cruza documentos" },
              { icon: <Zap size={20} />, text: "Detecta errores" },
              { icon: <CheckCircle size={20} />, text: "Te avisa" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-white/5 rounded-xl p-4">
                <span className="text-blue-400">{f.icon}</span>
                <p className="text-xs font-semibold text-white/70">{f.text}</p>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-sm mt-8">Sin instalar nada. Desde el navegador. Se adapta a cómo trabajas.</p>
        </div>
      </S>

      {/* 6 — FLOW */}
      <S active={c === 5}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-5xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em] mb-3">Flujo completo</p>
          <p className="text-3xl font-black text-center mb-8">Del pedido al cobro. Todo conectado.</p>
          <div className="w-full space-y-3">
            {[
              { label: "ENTRADA", color: "from-blue-500/20 to-blue-500/5 border-blue-500/20", items: ["Necesidad", "Pedido", "Albarán", "Chequeo móvil"] },
              { label: "VERIFICACIÓN", color: "from-orange-500/20 to-orange-500/5 border-orange-500/20", items: ["Factura", "Cruce 4 docs", "Validación coste"] },
              { label: "FINANZAS", color: "from-green-500/20 to-green-500/5 border-green-500/20", items: ["Pagos", "Banco", "Ventas", "Rentabilidad"] },
              { label: "DIRECCIÓN", color: "from-purple-500/20 to-purple-500/5 border-purple-500/20", items: ["Calendario", "Base info", "Parte diario", "PANEL"] },
            ].map((row, ri) => (
              <div key={ri} className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-r ${row.color} px-5 py-3`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 w-28 text-right flex-shrink-0">{row.label}</span>
                <div className="flex-1 flex items-center gap-2">
                  {row.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      {ii > 0 && <ArrowRight size={12} className="text-white/15" />}
                      <div className={`rounded-xl bg-white/5 px-3 py-2 text-center ${item === "PANEL" ? "bg-white/10 ring-1 ring-white/20" : ""}`}>
                        <p className={`text-xs font-bold ${item === "PANEL" ? "text-white" : "text-white/70"}`}>{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-6">15 piezas conectadas. Todo converge en el panel.</p>
        </div>
      </S>

      {/* 7 — AGENTES */}
      <S active={c === 6}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-4xl mx-auto">
          <p className="text-3xl sm:text-4xl font-black text-center leading-tight mb-10">
            8 agentes vigilan tu negocio.
            <br /><span className="text-cyan-400">Tú solo miras el resultado.</span>
          </p>
          <div className="grid grid-cols-4 gap-3 w-full mb-6">
            {[
              { n: "Compras", icon: <Package size={20} />, c: "from-blue-500" },
              { n: "Recepción", icon: <CheckCircle size={20} />, c: "from-emerald-500" },
              { n: "Facturas", icon: <FileX size={20} />, c: "from-purple-500" },
              { n: "Tesorería", icon: <TrendingDown size={20} />, c: "from-yellow-500" },
              { n: "Ventas", icon: <Zap size={20} />, c: "from-cyan-500" },
              { n: "Rentabilidad", icon: <Eye size={20} />, c: "from-orange-500" },
              { n: "Agenda", icon: <Clock size={20} />, c: "from-pink-500" },
              { n: "Operaciones", icon: <Truck size={20} />, c: "from-green-500" },
            ].map((a) => (
              <div key={a.n} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/[0.08] transition-colors">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.c} to-transparent flex items-center justify-center text-white`}>
                  {a.icon}
                </div>
                <p className="text-xs font-bold text-white/80">{a.n}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl px-8 py-4 flex items-center gap-4">
            <Brain size={28} className="text-blue-400" />
            <div>
              <p className="text-base font-black text-white">Supervisor</p>
              <p className="text-xs text-white/40">Reúne todo · Prioriza · Genera el parte diario</p>
            </div>
          </div>
        </div>
      </S>

      {/* 8 — TIMELINE */}
      <S active={c === 7}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-4xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em] mb-2">Así funciona</p>
          <p className="text-3xl font-black text-center mb-6">Lunes 9:15. Llega un camión.</p>
          <div className="w-full flex gap-6">
            {/* Timeline */}
            <div className="flex-1 space-y-1">
              {[
                { t: "9:00", text: "Pedido: 3 frigoríficos + 2 lavavajillas", c: "border-blue-500/30 bg-blue-500/5" },
                { t: "9:15", text: "Juan abre la app. Ve lo esperado.", c: "border-blue-500/30 bg-blue-500/5" },
                { t: "9:18", text: "Marca: 2 frig. (1 golpe). 0 lavavajillas.", c: "border-orange-500/30 bg-orange-500/5" },
                { t: "9:19", text: "3 incidencias creadas automáticamente", c: "border-red-500/30 bg-red-500/5" },
                { t: "9:19", text: "Alerta: factura no cuadrará", c: "border-red-500/30 bg-red-500/5" },
                { t: "9:30", text: "María ve todo desde casa", c: "border-green-500/30 bg-green-500/5" },
                { t: "9:32", text: "Llama al proveedor con datos", c: "border-green-500/30 bg-green-500/5" },
                { t: "9:35", text: "Registrado. No se pierde nada.", c: "border-green-500/30 bg-green-500/5" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 border rounded-xl ${s.c} px-3 py-2`}>
                  <span className="text-[10px] font-mono text-white/25 w-8 flex-shrink-0">{s.t}</span>
                  <p className="text-xs font-medium text-white/80">{s.text}</p>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div className="w-48 flex flex-col items-center justify-center gap-4">
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { m: "Antes", v: 0 }, { m: "9:18", v: 30 }, { m: "9:19", v: 90 }, { m: "9:30", v: 95 }, { m: "9:35", v: 100 },
                  ]}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#22c55e" fill="url(#cg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-white/30 text-center">Control alcanzado en 20 min</p>
              <p className="text-[10px] text-white/15 text-center">Antes: 1 semana (si alguien se acordaba)</p>
            </div>
          </div>
        </div>
      </S>

      {/* 9 — DASHBOARD */}
      <S active={c === 8}>
        <div className="flex flex-col items-center justify-center h-full px-10 max-w-5xl mx-auto">
          <p className="text-3xl sm:text-4xl font-black text-center mb-6">10 segundos. Sabe todo.</p>
          <div className="w-full rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-3">
            {/* Alert banner */}
            <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-3 text-center">
              <p className="text-xs text-red-100 font-bold uppercase tracking-wider">Tienes</p>
              <p className="text-4xl font-black text-white">5 problemas</p>
            </div>
            {/* KPIs + Mini chart */}
            <div className="flex gap-3">
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                {[
                  { v: "3", l: "Incid.", c: "text-red-400" },
                  { v: "3", l: "Pedidos", c: "text-orange-400" },
                  { v: "1", l: "Recep.", c: "text-green-400" },
                  { v: "1", l: "Vehic.", c: "text-blue-400" },
                  { v: "2", l: "Entreg.", c: "text-blue-400" },
                ].map((k, i) => (
                  <div key={i} className="bg-white/[0.04] rounded-xl p-2 text-center">
                    <p className={`text-2xl font-black ${k.c}`}>{k.v}</p>
                    <p className="text-[9px] text-white/25 font-bold uppercase">{k.l}</p>
                  </div>
                ))}
              </div>
              {/* Sparkline */}
              <div className="w-32 bg-white/[0.04] rounded-xl p-2">
                <p className="text-[9px] text-white/25 font-bold uppercase mb-1">Incidencias/sem</p>
                <ResponsiveContainer width="100%" height={50}>
                  <AreaChart data={[{ d: "L", v: 1 }, { d: "M", v: 3 }, { d: "X", v: 2 }, { d: "J", v: 5 }, { d: "V", v: 3 }]}>
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#ef4444" fill="url(#rg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Alerts */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                {[
                  "Frigorífico Bosch — falta 1",
                  "Factura no cuadra",
                  "Entrega fallida",
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="text-[11px] text-white/50">{a}</p>
                  </div>
                ))}
              </div>
              {/* Audio */}
              <div className="bg-white/[0.04] rounded-xl p-3 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">▶</div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Parte diario</p>
                </div>
                <p className="text-[11px] text-white/30 italic leading-relaxed">
                  &quot;Hoy tienes 3 incidencias abiertas, 1 entrega fallida, y 2 pedidos pendientes...&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </S>

      {/* 10 — CIERRE */}
      <S active={c === 9}>
        <div className="flex flex-col items-center justify-center h-full text-center px-10 max-w-3xl mx-auto">
          <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-black leading-[1.12]">
            Esto ya te está pasando.
          </p>
          <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-black leading-[1.12] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-2">
            La diferencia es si lo controlas o no.
          </p>
          <div className="mt-10 flex items-center gap-6">
            {[
              { icon: <CheckCircle size={20} />, text: "Sin instalar nada" },
              { icon: <Shield size={20} />, text: "8 agentes vigilando" },
              { icon: <Eye size={20} />, text: "Control total" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-white/30">
                {f.icon}
                <p className="text-xs font-medium">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 h-px w-16 bg-white/10 mx-auto" />
          <p className="text-xl font-bold text-white/80 mt-8">¿Lo vemos funcionando con tus datos?</p>
          <p className="text-xs text-white/15 mt-6">ten21.vercel.app</p>
        </div>
      </S>
    </div>
  );
}

function S({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={`absolute inset-0 transition-all duration-700 ease-out ${active ? "opacity-100 scale-100" : "opacity-0 scale-[0.97] pointer-events-none"}`}>
      {children}
    </div>
  );
}
