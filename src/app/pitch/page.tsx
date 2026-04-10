"use client";

import { useState } from "react";

// ============================================================
// Full-screen presentation with keyboard/click navigation
// Premium dark design. No scroll. One slide at a time.
// ============================================================

const TOTAL = 10;

export default function PitchPage() {
  const [current, setCurrent] = useState(0);

  function next() { setCurrent((c) => Math.min(c + 1, TOTAL - 1)); }
  function prev() { setCurrent((c) => Math.max(c - 1, 0)); }

  return (
    <div
      className="h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden select-none relative"
      onClick={next}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === " ") next();
        if (e.key === "ArrowLeft") prev();
      }}
      tabIndex={0}
      suppressHydrationWarning
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
        />
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-6 right-8 z-50 flex items-center gap-4">
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="text-white/20 hover:text-white/60 text-2xl transition-colors">←</button>
        <span className="text-white/20 text-xs font-mono">{current + 1}/{TOTAL}</span>
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="text-white/20 hover:text-white/60 text-2xl transition-colors">→</button>
      </div>

      {/* ============================================= */}
      {/* SLIDES */}
      {/* ============================================= */}

      {/* 1 — HOOK */}
      <Slide active={current === 0}>
        <div className="flex flex-col items-center justify-center h-full text-center px-12">
          <p className="text-[clamp(1.5rem,5vw,4.5rem)] font-black leading-[1.1] max-w-4xl">
            Cada mes tu tienda pierde dinero
            <br />
            <span className="text-red-500">y nadie se da cuenta.</span>
          </p>
        </div>
      </Slide>

      {/* 2 — ESCENA */}
      <Slide active={current === 1}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-3xl mx-auto">
          <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.3em] mb-8">ESCENA REAL</p>
          <div className="space-y-6 text-center">
            <p className="text-[clamp(1.2rem,3vw,2.2rem)] font-bold text-white/90">Llega un camión con 3 frigoríficos.</p>
            <p className="text-[clamp(1.2rem,3vw,2.2rem)] font-bold text-white/60">Llegan 2. Uno tiene un golpe.</p>
            <p className="text-[clamp(1.2rem,3vw,2.2rem)] font-bold text-white/40">La factura cobra 3.</p>
            <div className="pt-4">
              <p className="text-[clamp(1.2rem,3vw,2.2rem)] font-black text-red-500">Nadie se entera.</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* 3 — POR QUÉ */}
      <Slide active={current === 2}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-4xl mx-auto">
          <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-black text-center leading-[1.15] mb-12">
            Porque la información de tu negocio
            <br />
            <span className="text-orange-400">no está conectada.</span>
          </p>
          <div className="flex items-center gap-5">
            {["Pedido", "Albarán", "Factura", "Banco"].map((doc, i) => (
              <div key={i} className="flex items-center gap-5">
                {i > 0 && <span className="text-red-500/50 text-3xl font-light">/</span>}
                <div className="border border-white/10 rounded-2xl px-6 py-4 bg-white/5">
                  <p className="text-lg font-bold text-white/80">{doc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-lg mt-10">Cada documento va por su lado. Nadie los cruza.</p>
        </div>
      </Slide>

      {/* 4 — DATO */}
      <Slide active={current === 3}>
        <div className="flex flex-col items-center justify-center h-full text-center px-12">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-6">EN UNA TIENDA MEDIA</p>
          <p className="text-[clamp(3rem,10vw,10rem)] font-black leading-none text-white">3 de 100</p>
          <p className="text-[clamp(1rem,2.5vw,1.8rem)] text-white/50 mt-4 font-medium">
            recepciones tienen errores que nadie detecta.
          </p>
          <p className="text-red-500/80 text-lg mt-8 font-semibold">
            Mercancía que falta. Productos dañados. Facturas que no cuadran.
          </p>
        </div>
      </Slide>

      {/* 5 — SOLUCIÓN */}
      <Slide active={current === 4}>
        <div className="flex flex-col items-center justify-center h-full text-center px-12">
          <div className="h-16 w-16 rounded-full bg-blue-500 mb-8" />
          <p className="text-[clamp(1.5rem,4.5vw,4rem)] font-black leading-[1.1] max-w-3xl">
            Un sistema que vigila
            <br />
            cada parte de tu negocio.
          </p>
          <p className="text-white/40 text-lg mt-8 max-w-lg">
            Cruza documentos. Detecta errores. Te avisa.
            <br />Sin instalar nada. Desde el navegador.
          </p>
        </div>
      </Slide>

      {/* 6 — CÓMO FUNCIONA */}
      <Slide active={current === 5}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-5xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-10">ASÍ FUNCIONA</p>
          <div className="w-full grid grid-cols-5 gap-3">
            {[
              { label: "Pedido", desc: "Lo que pides", color: "border-blue-500/40" },
              { label: "Recepción", desc: "Lo que llega", color: "border-blue-500/40" },
              { label: "Verificación", desc: "Se cruza todo", color: "border-orange-500/40" },
              { label: "Finanzas", desc: "Pagos y banco", color: "border-green-500/40" },
              { label: "Panel", desc: "Tú decides", color: "border-white/40" },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i > 0 && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-white/15 text-xl">→</div>
                )}
                <div className={`border ${step.color} rounded-2xl p-5 text-center bg-white/[0.03] h-full`}>
                  <p className="text-white/90 font-bold text-sm">{step.label}</p>
                  <p className="text-white/30 text-xs mt-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
            {["Albarán", "Chequeo", "Factura", "Coste", "Banco", "Ventas", "Rentabilidad", "Calendario"].map((sub) => (
              <span key={sub} className="text-[11px] text-white/20 bg-white/5 rounded-full px-3 py-1">{sub}</span>
            ))}
          </div>
          <p className="text-white/25 text-sm mt-8">15 piezas conectadas. Todo automático.</p>
        </div>
      </Slide>

      {/* 7 — AGENTES */}
      <Slide active={current === 6}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-4xl mx-auto">
          <p className="text-[clamp(1.3rem,3.5vw,2.8rem)] font-black text-center leading-[1.15] mb-12">
            8 agentes vigilan tu negocio.
            <br />
            <span className="text-blue-400">Tú solo miras el resultado.</span>
          </p>
          <div className="grid grid-cols-4 gap-3 w-full">
            {[
              { n: "Compras", c: "bg-blue-500" },
              { n: "Recepción", c: "bg-emerald-500" },
              { n: "Facturas", c: "bg-purple-500" },
              { n: "Tesorería", c: "bg-yellow-500" },
              { n: "Ventas", c: "bg-cyan-500" },
              { n: "Rentabilidad", c: "bg-orange-500" },
              { n: "Agenda", c: "bg-pink-500" },
              { n: "Operaciones", c: "bg-green-500" },
            ].map((a) => (
              <div key={a.n} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <div className={`h-3 w-3 rounded-full ${a.c} flex-shrink-0`} />
                <p className="text-sm font-semibold text-white/80">{a.n}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-white/10 rounded-2xl px-8 py-4 bg-white/[0.03] text-center">
            <p className="text-lg font-black text-white">Supervisor</p>
            <p className="text-xs text-white/30 mt-1">Reúne todo. Prioriza. Te dice qué mirar.</p>
          </div>
        </div>
      </Slide>

      {/* 8 — EJEMPLO */}
      <Slide active={current === 7}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-3xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-8">EJEMPLO REAL</p>
          <div className="w-full space-y-1.5">
            {[
              { t: "9:00", text: "Pedido: 3 frigoríficos + 2 lavavajillas", o: "1" },
              { t: "9:15", text: "Llega el camión. Juan abre la app.", o: "0.85" },
              { t: "9:18", text: "Marca: 2 frigoríficos (1 con golpe). 0 lavavajillas.", o: "0.7" },
              { t: "9:19", text: "El sistema crea 3 incidencias.", color: "text-red-400", o: "1" },
              { t: "9:19", text: "Detecta que la factura no cuadrará.", color: "text-red-400", o: "1" },
              { t: "9:30", text: "María ve todo en el panel. Desde casa.", color: "text-green-400", o: "1" },
              { t: "9:32", text: "Llama al proveedor. Con datos.", color: "text-green-400", o: "1" },
              { t: "9:35", text: "Queda registrado. No se pierde nada.", color: "text-green-400", o: "1" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-5">
                <span className="text-xs font-mono text-white/25 w-10 flex-shrink-0 text-right">{s.t}</span>
                <div className="h-px flex-grow-0 w-4 bg-white/10" />
                <p className={`text-base font-medium ${s.color || "text-white"}`} style={{ opacity: s.o }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-sm mt-10">Antes tardaba una semana. Si es que alguien se acordaba.</p>
        </div>
      </Slide>

      {/* 9 — DASHBOARD */}
      <Slide active={current === 8}>
        <div className="flex flex-col items-center justify-center h-full px-12 max-w-4xl mx-auto">
          <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-3">EL PANEL</p>
          <p className="text-[clamp(1.3rem,3vw,2.5rem)] font-black text-center mb-8">
            10 segundos. Sabe todo.
          </p>
          <div className="w-full rounded-3xl bg-white/[0.04] border border-white/10 p-6 space-y-4">
            {/* Alert */}
            <div className="rounded-2xl bg-red-600 py-4 text-center">
              <p className="text-sm text-red-100 font-bold uppercase tracking-wider">Tienes</p>
              <p className="text-4xl font-black text-white">5 problemas</p>
            </div>
            {/* KPIs */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { v: "3", l: "Incidencias", c: "text-red-400" },
                { v: "3", l: "Pedidos", c: "text-orange-400" },
                { v: "1", l: "Recepciones", c: "text-green-400" },
                { v: "1", l: "Vehículos", c: "text-blue-400" },
                { v: "2", l: "Entregas", c: "text-blue-400" },
              ].map((k, i) => (
                <div key={i} className="text-center py-2">
                  <p className={`text-3xl font-black ${k.c}`}>{k.v}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase mt-1">{k.l}</p>
                </div>
              ))}
            </div>
            {/* Alerts list */}
            <div className="space-y-1.5">
              {[
                "Frigorífico Bosch — falta 1 unidad",
                "Isabel Navarro — entrega fallida",
                "PED-002 — recibido parcialmente",
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-sm text-white/60">{a}</p>
                </div>
              ))}
            </div>
            {/* Audio */}
            <div className="rounded-xl bg-white/5 p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">▶</div>
              <div>
                <p className="text-xs font-bold text-white/50">PARTE DIARIO</p>
                <p className="text-xs text-white/30 italic">&quot;Hoy tienes 3 incidencias abiertas y una entrega fallida...&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* 10 — CIERRE */}
      <Slide active={current === 9}>
        <div className="flex flex-col items-center justify-center h-full text-center px-12 max-w-3xl mx-auto">
          <p className="text-[clamp(1.5rem,4.5vw,3.5rem)] font-black leading-[1.15]">
            Esto ya te está pasando.
          </p>
          <p className="text-[clamp(1.5rem,4.5vw,3.5rem)] font-black leading-[1.15] text-blue-400 mt-3">
            La diferencia es si lo controlas o no.
          </p>
          <div className="mt-12 h-px w-16 bg-white/10 mx-auto" />
          <p className="text-xl font-bold text-white/80 mt-10">
            ¿Lo vemos funcionando con tus datos?
          </p>
          <p className="text-sm text-white/20 mt-8">ten21.vercel.app</p>
        </div>
      </Slide>
    </div>
  );
}

function Slide({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-out ${
        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}
