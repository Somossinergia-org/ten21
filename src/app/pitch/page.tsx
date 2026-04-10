import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ten21 — Dirige tu empresa desde una sola pantalla",
  description: "Panel de control total para tiendas de electrodomésticos",
};

// ============================================================
// COMPONENTS
// ============================================================

function Bar({ value, max, color, label, suffix }: { value: number; max: number; color: string; label: string; suffix?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-400 w-28 text-right">{label}</span>
      <div className="flex-1 h-10 bg-gray-800 rounded-lg overflow-hidden">
        <div className={`h-full ${color} rounded-lg flex items-center justify-end pr-4`} style={{ width: `${pct}%` }}>
          <span className="text-sm font-black text-white">{value}{suffix || "h"}</span>
        </div>
      </div>
    </div>
  );
}

function CompareBar({ label, before, after, max }: { label: string; before: number; after: number; max: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 w-10 text-right">{before}h</span>
        <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
          <div className="h-full bg-red-500/60 rounded" style={{ width: `${(before / max) * 100}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400 w-10 text-right">{after}h</span>
        <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
          <div className="h-full bg-green-500 rounded" style={{ width: `${(after / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function MoneyCard({ amount, label, sub, color }: { amount: string; label: string; sub: string; color: string }) {
  return (
    <div className={`rounded-2xl ${color} p-6 text-center`}>
      <p className="text-4xl sm:text-5xl font-black">{amount}</p>
      <p className="text-sm font-bold mt-2">{label}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}

// ============================================================
// SLIDES
// ============================================================

const slides = [
  // 1 — PORTADA (impacto)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest">
            Software para tiendas de electrodomésticos
          </span>
        </div>
        <p className="text-5xl sm:text-8xl font-black text-white tracking-tight leading-[0.9]">
          Tu empresa.<br />
          <span className="text-blue-400">Bajo control.</span>
        </p>
        <p className="mt-8 text-lg sm:text-xl text-gray-400 font-medium max-w-xl">
          El panel de dirección que necesitas para dejar de perseguir información y empezar a dirigir.
        </p>
        <div className="mt-12 flex items-center gap-6">
          <Link href="/login" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            Ver demo en vivo →
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Producto real funcionando</span>
          </div>
        </div>
      </div>
    ),
  },

  // 2 — EL DOLOR (emocional, directo)
  {
    bg: "bg-red-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-400 mb-6">La realidad de hoy</p>
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight mb-10">
          ¿Te suena esto?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl text-left">
          {[
            { q: "¿Ha llegado el pedido de ayer?", who: "— Tú al almacén, a las 9:00" },
            { q: "¿Faltaba algo en el último envío?", who: "— Tú al de recepción, a las 10:30" },
            { q: "¿La furgoneta ha salido ya?", who: "— Tú al repartidor, a las 11:00" },
            { q: "¿Se reclamó el frigorífico con el golpe?", who: "— Tú a nadie, porque se olvidó" },
            { q: "¿Cuántos errores hay este mes?", who: "— No lo sabes. Nadie lo sabe." },
            { q: "¿Estoy perdiendo dinero sin darme cuenta?", who: "— Probablemente sí." },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-red-500/20 px-5 py-4">
              <p className="text-base font-bold text-white">&quot;{item.q}&quot;</p>
              <p className="text-xs text-red-300 mt-1">{item.who}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xl font-bold text-red-300">
          Cada pregunta sin respuesta inmediata es tiempo y dinero perdido.
        </p>
      </div>
    ),
  },

  // 3 — EL COSTE EN NÚMEROS
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Lo que cuestan los problemas</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-10">
          En una tienda media, cada año:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-10">
          <MoneyCard amount="1.352" label="horas perdidas" sub="26h/semana × 52 semanas" color="bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl" />
          <MoneyCard amount="2.400€" label="en errores" sub="mercancía no reclamada" color="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl" />
          <MoneyCard amount="780€" label="en retrasos" sub="entregas fallidas y repetidas" color="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-2xl" />
          <MoneyCard amount="∞" label="en estrés" sub="del jefe todos los días" color="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl" />
        </div>
        <div className="w-full space-y-3 max-w-2xl">
          <Bar value={8} max={10} color="bg-red-500" label="Llamar" />
          <Bar value={6} max={10} color="bg-orange-500" label="Revisar docs" />
          <Bar value={5} max={10} color="bg-yellow-500" label="Comprobar" />
          <Bar value={4} max={10} color="bg-amber-500" label="Reclamar" />
          <Bar value={3} max={10} color="bg-red-400" label="Buscar info" />
        </div>
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-center">
          <p className="text-2xl font-black text-red-400">26 horas cada semana</p>
          <p className="text-sm text-red-300/60">dedicadas a perseguir, no a vender</p>
        </div>
      </div>
    ),
  },

  // 4 — LA SOLUCIÓN (una frase)
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-8">La solución</p>
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
          Un sistema que conecta<br />toda tu operativa
        </p>
        <p className="mt-6 text-xl text-blue-100">
          y te avisa automáticamente cuando algo falla.
        </p>
        <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
          {["Pedido", "Recepción", "Comprobación", "Incidencia", "Panel"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-2xl text-blue-300">→</span>}
              <div className={`rounded-full px-5 py-2.5 text-sm font-bold ${i === 2 || i === 3 ? "bg-white text-blue-600" : "bg-white/20 text-white"}`}>
                {step}
                {(i === 2 || i === 3) && <span className="ml-1 text-xs">auto</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg text-blue-200 font-medium">
          El jefe no pregunta. El jefe mira. Y decide.
        </p>
      </div>
    ),
  },

  // 5 — ANTES vs DESPUÉS (comparativo visual)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">El cambio</p>
        <p className="text-3xl sm:text-4xl font-black text-white text-center mb-3">
          Antes vs Después
        </p>
        <p className="text-base text-gray-400 text-center mb-8">Horas semanales dedicadas a cada tarea</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 w-full max-w-4xl">
          <CompareBar label="Saber si llegó mercancía" before={8} after={0} max={10} />
          <CompareBar label="Detectar errores" before={6} after={0} max={10} />
          <CompareBar label="Reclamar a proveedores" before={4} after={1} max={10} />
          <CompareBar label="Controlar entregas" before={5} after={1} max={10} />
          <CompareBar label="Buscar información" before={3} after={0} max={10} />
          <CompareBar label="Saber cómo va el negocio" before={6} after={1} max={10} />
        </div>
        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-red-500/60 rounded" /><span className="text-xs text-gray-400">Antes: 26h/sem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-green-500 rounded" /><span className="text-xs text-gray-400">Después: 3h/sem</span>
          </div>
          <div className="rounded-full bg-green-500/20 border border-green-500/30 px-4 py-1.5">
            <span className="text-sm font-black text-green-400">-88% de tiempo</span>
          </div>
        </div>
      </div>
    ),
  },

  // 6 — EJEMPLO REAL (storytelling)
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Caso real</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-8">
          Lunes, 9:15. Llega un camión.
        </p>
        <div className="w-full space-y-3">
          {[
            { time: "9:15", icon: "📦", text: "Llegan 3 frigoríficos, 2 hornos y 2 lavavajillas", color: "bg-blue-50 border-blue-200" },
            { time: "9:20", icon: "👤", text: "Juan del almacén abre la app. Selecciona el pedido.", color: "bg-blue-50 border-blue-200" },
            { time: "9:22", icon: "✏️", text: "Marca: frigoríficos recibidos 2 (de 3). Uno con golpe. Lavavajillas: 0.", color: "bg-orange-50 border-orange-200" },
            { time: "9:23", icon: "⚡", text: "El sistema crea 3 incidencias automáticamente", color: "bg-red-50 border-red-300" },
            { time: "9:23", icon: "📊", text: "El pedido pasa a 'Parcial'. Las incidencias aparecen en el panel.", color: "bg-red-50 border-red-300" },
            { time: "9:30", icon: "👔", text: "María (la jefa) abre el panel desde casa. Ve todo en rojo.", color: "bg-green-50 border-green-200" },
            { time: "9:31", icon: "📞", text: "Llama al proveedor CON LOS DATOS delante. Reclama.", color: "bg-green-50 border-green-200" },
            { time: "9:35", icon: "✅", text: "Marca la incidencia como 'Notificada'. Queda registrado.", color: "bg-green-50 border-green-300" },
          ].map((step, i) => (
            <div key={i} className={`flex items-start gap-4 rounded-xl border-2 ${step.color} px-5 py-3`}>
              <span className="text-xs font-mono font-bold text-gray-400 mt-0.5 w-10">{step.time}</span>
              <span className="text-xl">{step.icon}</span>
              <p className="text-sm font-semibold text-gray-900 flex-1">{step.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-base font-bold text-gray-900 text-center">
          20 minutos. Sin papel. Sin llamar al almacén. Sin perder nada.
        </p>
      </div>
    ),
  },

  // 7 — DASHBOARD REAL
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Producto real</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-2">
          Esto es lo que ve el jefe.
        </p>
        <p className="text-base text-gray-400 text-center mb-6">
          Cada mañana. En 10 segundos. Desde cualquier sitio.
        </p>
        <div className="w-full rounded-2xl bg-gray-800 p-5 space-y-3 shadow-2xl">
          <div className="rounded-xl bg-red-700 py-4 text-center">
            <p className="text-xs text-red-200 font-bold uppercase tracking-wider">Tienes</p>
            <p className="text-4xl font-black text-white mt-1">5 problemas importantes</p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { v: "3", l: "Incidencias", c: "bg-red-500/20 text-red-400 border-red-500/30" },
              { v: "3", l: "Pedidos", c: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
              { v: "1", l: "Recepciones", c: "bg-green-500/20 text-green-400 border-green-500/30" },
              { v: "1", l: "Vehículos", c: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
              { v: "2", l: "Entregas", c: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
            ].map((k, i) => (
              <div key={i} className={`rounded-xl border ${k.c} p-3 text-center`}>
                <p className="text-3xl font-black">{k.v}</p>
                <p className="text-[10px] font-bold uppercase mt-1 opacity-70">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { text: "Frigorífico Bosch: falta 1 unidad", tag: "Incidencia", tagColor: "bg-red-500/20 text-red-400" },
              { text: "Lavavajillas Bosch: no llegaron (2 uds)", tag: "Incidencia", tagColor: "bg-red-500/20 text-red-400" },
              { text: "Isabel Navarro: entrega fallida ayer", tag: "Entrega", tagColor: "bg-orange-500/20 text-orange-400" },
              { text: "PED-002 Bosch: recibido parcialmente", tag: "Pedido", tagColor: "bg-yellow-500/20 text-yellow-400" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-700/50 px-4 py-2.5 hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-gray-200 flex-1">{a.text}</p>
                <span className={`rounded-full ${a.tagColor} px-2.5 py-0.5 text-xs font-bold flex-shrink-0`}>{a.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs text-gray-500">Esto no es un mockup. Es el sistema real.</p>
        </div>
      </div>
    ),
  },

  // 8 — ROI CLARO
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600 mb-4">Retorno</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          ¿Cuánto recuperas?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-8">
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-8 text-center">
            <p className="text-6xl font-black text-green-700">23h</p>
            <p className="text-base font-bold text-green-800 mt-3">recuperadas<br />cada semana</p>
            <p className="text-xs text-green-600/60 mt-2">De 26h a 3h en tareas de control</p>
          </div>
          <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-8 text-center">
            <p className="text-6xl font-black text-blue-700">3.180€</p>
            <p className="text-base font-bold text-blue-800 mt-3">ahorro anual<br />estimado</p>
            <p className="text-xs text-blue-600/60 mt-2">Errores evitados + tiempo recuperado</p>
          </div>
          <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-8 text-center">
            <p className="text-6xl font-black text-purple-700">100%</p>
            <p className="text-base font-bold text-purple-800 mt-3">visibilidad<br />del negocio</p>
            <p className="text-xs text-purple-600/60 mt-2">Todo registrado y trazable</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900 p-6 w-full text-center">
          <p className="text-lg text-gray-400">El sistema se paga solo en</p>
          <p className="text-4xl font-black text-white mt-1">menos de 2 meses</p>
        </div>
      </div>
    ),
  },

  // 9 — MÓDULOS + VISIÓN + SAAS
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">Plataforma completa</p>
        <p className="text-3xl sm:text-4xl font-black text-white text-center mb-8">
          Todo lo que necesita una tienda. En una app.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-4">
          {[
            { icon: "📋", name: "Compras", live: true },
            { icon: "📦", name: "Recepción", live: true },
            { icon: "⚠️", name: "Incidencias", live: true },
            { icon: "🚛", name: "Entregas + GPS", live: true },
            { icon: "💰", name: "Tesorería", live: false },
            { icon: "📈", name: "Ventas", live: false },
            { icon: "📊", name: "Rentabilidad", live: false },
            { icon: "📅", name: "Calendario", live: false },
          ].map((m, i) => (
            <div key={i} className={`rounded-xl p-4 text-center ${m.live ? "bg-blue-500/10 border border-blue-500/30" : "bg-gray-800/50 border border-gray-700"}`}>
              <p className="text-xl mb-1">{m.icon}</p>
              <p className="text-xs font-bold text-white">{m.name}</p>
              <p className={`text-[10px] mt-0.5 ${m.live ? "text-green-400" : "text-gray-500"}`}>
                {m.live ? "● Funcionando" : "○ Próximamente"}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 px-8 py-4 text-center w-full max-w-sm mb-8">
          <p className="text-lg font-black text-blue-400">PANEL DE DIRECCIÓN</p>
          <p className="text-xs text-blue-300/60">Todo converge aquí</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-5 w-full max-w-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 text-center">
            <div className="flex-1">
              <p className="text-2xl font-black text-white">+4.000</p>
              <p className="text-xs text-gray-400">tiendas en España</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="flex-1">
              <p className="text-2xl font-black text-white">Multi-tenant</p>
              <p className="text-xs text-gray-400">cada tienda aislada</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="flex-1">
              <p className="text-2xl font-black text-blue-400">Setup + €/mes</p>
              <p className="text-xs text-gray-400">modelo SaaS</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 10 — CIERRE (potente)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
          No vendemos<br />automatizaciones.
        </p>
        <p className="text-4xl sm:text-6xl font-black text-blue-400 mt-4 leading-tight">
          Vendemos una forma<br />de dirigir mejor.
        </p>
        <div className="mt-10 grid grid-cols-4 gap-4 w-full max-w-lg">
          <div className="text-center">
            <p className="text-2xl font-black text-red-400">-88%</p>
            <p className="text-[10px] text-gray-500 mt-1">tiempo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-400">0</p>
            <p className="text-[10px] text-gray-500 mt-1">errores ocultos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-400">3.180€</p>
            <p className="text-[10px] text-gray-500 mt-1">ahorro/año</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-400">100%</p>
            <p className="text-[10px] text-gray-500 mt-1">trazabilidad</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/login" className="rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
            Probar la demo ahora →
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          ten21.vercel.app — Construido. Funcionando. Listo para escalar.
        </p>
      </div>
    ),
  },
];

export default function PitchPage() {
  return (
    <div className="scroll-smooth">
      {slides.map((slide, i) => (
        <section key={i} className={`min-h-screen w-full ${slide.bg} flex items-center justify-center relative`}>
          {slide.content}
          <div className="absolute bottom-4 right-6">
            <span className={`text-xs font-mono ${slide.bg.includes("950") || slide.bg.includes("900") || slide.bg.includes("blue-600") || slide.bg.includes("red-950") ? "text-white/20" : "text-gray-300"}`}>
              {i + 1} / {slides.length}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
