import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ten21 — Dirige tu empresa desde una sola pantalla",
  description: "Panel de control total para tiendas de electrodomésticos",
};

// ============================================================
// COMPONENTS
// ============================================================

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500 w-24 text-right">{label}</span>
      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full flex items-center justify-end pr-3`} style={{ width: `${pct}%` }}>
          <span className="text-xs font-bold text-white">{value}h</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, unit, label, color }: { value: string; unit?: string; label: string; color: string }) {
  return (
    <div className={`rounded-2xl ${color} p-6 text-center`}>
      <p className="text-4xl sm:text-5xl font-black">{value}<span className="text-2xl">{unit}</span></p>
      <p className="mt-2 text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}

function ProblemRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4">
      <span className="text-2xl">{icon}</span>
      <p className="text-base sm:text-lg font-semibold text-red-100">{text}</p>
    </div>
  );
}

function BeforeAfter({ before, after, saving }: { before: string; after: string; saving: string }) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="flex-1 rounded-xl bg-red-50 border-2 border-red-200 p-4">
        <p className="text-xs font-bold uppercase text-red-400 mb-1">Antes</p>
        <p className="text-sm font-semibold text-red-900">{before}</p>
      </div>
      <div className="flex items-center"><span className="text-xl text-gray-300">→</span></div>
      <div className="flex-1 rounded-xl bg-green-50 border-2 border-green-200 p-4">
        <p className="text-xs font-bold uppercase text-green-500 mb-1">Ahora</p>
        <p className="text-sm font-semibold text-green-900">{after}</p>
      </div>
      <div className="flex items-center">
        <div className="rounded-full bg-blue-600 px-3 py-1.5">
          <p className="text-xs font-black text-white whitespace-nowrap">{saving}</p>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ name, desc, icon }: { name: string; desc: string; icon: string }) {
  return (
    <div className="rounded-xl border-2 border-gray-700 bg-gray-800/50 p-5 text-center">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-sm font-black text-white">{name}</p>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  );
}

// ============================================================
// SLIDES
// ============================================================

const slides = [
  // 1 — PORTADA
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <p className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-tight">
          Tu empresa entera<br />en una sola pantalla
        </p>
        <p className="mt-6 text-xl sm:text-2xl text-gray-400 font-medium max-w-2xl">
          El panel de control que el jefe de una tienda<br />de electrodomésticos siempre ha necesitado
        </p>
        <div className="mt-12 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <p className="text-sm text-gray-500 font-mono">ten21</p>
        </div>
      </div>
    ),
  },

  // 2 — QUÉ QUIERE EL CLIENTE
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Lo que importa</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          ¿Qué quiere realmente<br />el dueño de una tienda?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-3xl">
          {[
            "Trabajar menos",
            "Controlar más",
            "Equivocarse menos",
            "No estar encima de todo",
            "Detectar problemas antes",
            "Tener claridad",
            "Ganar más dinero",
            "Perder menos",
            "Empresa más ordenada",
          ].map((want, i) => (
            <div key={i} className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-center">
              <p className="text-sm font-bold text-blue-900">{want}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-gray-900 px-8 py-5 text-center max-w-2xl">
          <p className="text-base sm:text-lg font-bold text-white">
            &quot;Te damos control total de tu empresa en una sola pantalla<br />
            y reducimos trabajo, errores y pérdidas.&quot;
          </p>
        </div>
      </div>
    ),
  },

  // 3 — LOS 7 PROBLEMAS REALES
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4">La realidad</p>
        <p className="text-3xl sm:text-5xl font-black text-white text-center mb-8">
          7 problemas que cuestan dinero<br />todos los días
        </p>
        <div className="w-full space-y-2.5">
          <ProblemRow icon="📞" text="El jefe no puede estar en todo" />
          <ProblemRow icon="⏰" text="Se pierde tiempo administrativo todos los días" />
          <ProblemRow icon="📦" text="Se cometen errores en recepción de mercancía" />
          <ProblemRow icon="💰" text="Se pierde control del dinero y los pagos" />
          <ProblemRow icon="📊" text="Se vende mucho sin saber si se gana" />
          <ProblemRow icon="📧" text="La información importante está desperdigada" />
          <ProblemRow icon="🔍" text="Falta una visión clara del negocio" />
        </div>
      </div>
    ),
  },

  // 4 — COSTE DEL CAOS (datos)
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4">El coste real</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          ¿Cuánto cuesta no tener control?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8">
          <StatCard value="26" unit="h" label="Horas/semana persiguiendo información" color="bg-red-50 text-red-900" />
          <StatCard value="3" unit="%" label="Errores de recepción no detectados" color="bg-orange-50 text-orange-900" />
          <StatCard value="2.400" unit="€" label="Pérdida estimada anual por errores" color="bg-red-100 text-red-900" />
          <StatCard value="0" unit="" label="Visibilidad real del jefe sobre la operativa" color="bg-gray-100 text-gray-900" />
        </div>
        <div className="w-full space-y-3 max-w-2xl">
          <Bar value={8} max={10} color="bg-red-500" label="Llamadas" />
          <Bar value={6} max={10} color="bg-orange-500" label="Revisar docs" />
          <Bar value={5} max={10} color="bg-yellow-500" label="Comprobar" />
          <Bar value={4} max={10} color="bg-amber-500" label="Reclamar" />
          <Bar value={3} max={10} color="bg-red-400" label="Buscar info" />
        </div>
      </div>
    ),
  },

  // 5 — ANTES vs AHORA
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600 mb-4">El cambio</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-8">
          De caos controlado a empresa dirigida
        </p>
        <div className="w-full space-y-3">
          <BeforeAfter before="Llamo al almacén para saber si llegó algo" after="Lo veo en el panel en 10 segundos" saving="-8h/sem" />
          <BeforeAfter before="Nadie detecta que falta mercancía" after="El sistema compara automáticamente" saving="-2.400€" />
          <BeforeAfter before="Reclamo al proveedor sin datos" after="Trazabilidad completa de cada error" saving="100%" />
          <BeforeAfter before="No sé si las furgonetas han salido" after="GPS + estado en tiempo real" saving="-5h/sem" />
          <BeforeAfter before="Reviso papeles para saber cómo va el negocio" after="Panel con visión global instantánea" saving="-6h/sem" />
          <BeforeAfter before="Información en correos, papeles y WhatsApp" after="Todo centralizado en una app" saving="Claridad" />
        </div>
      </div>
    ),
  },

  // 6 — LA EXPERIENCIA DEL JEFE
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-4">La experiencia</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-10">
          Así empieza el día el jefe
        </p>
        <div className="w-full space-y-3">
          {[
            { time: "8:00", action: "Abre el panel", detail: "Ve el estado general: verde o rojo" },
            { time: "8:01", action: "Revisa KPIs", detail: "Incidencias, pedidos, entregas, vehículos" },
            { time: "8:02", action: "Ve los problemas", detail: "Qué errores hay, qué falta, qué falló" },
            { time: "8:03", action: "Revisa el día", detail: "Recepciones y entregas programadas para hoy" },
            { time: "8:05", action: "Decide qué atender", detail: "Entra al detalle solo si hace falta" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur px-5 py-4">
              <span className="text-sm font-mono font-bold text-blue-200 w-12">{step.time}</span>
              <div className="flex-1">
                <p className="text-base font-bold text-white">{step.action}</p>
                <p className="text-sm text-blue-200">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-lg text-blue-100 font-bold text-center">
          En 5 minutos sabe todo. Sin llamar a nadie.
        </p>
      </div>
    ),
  },

  // 7 — MÓDULOS DEL SISTEMA
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">El sistema completo</p>
        <p className="text-3xl sm:text-4xl font-black text-white text-center mb-3">
          Todo lo que necesita una tienda
        </p>
        <p className="text-base text-gray-400 text-center mb-8">Módulos conectados. Panel central.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
          <ModuleCard icon="📋" name="Compras" desc="Pedidos a proveedor" />
          <ModuleCard icon="📦" name="Recepción" desc="Chequeo automático" />
          <ModuleCard icon="⚠️" name="Incidencias" desc="Detección de errores" />
          <ModuleCard icon="🚛" name="Entregas" desc="Vehículos y GPS" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
          <ModuleCard icon="💰" name="Tesorería" desc="Control de caja y pagos" />
          <ModuleCard icon="📈" name="Ventas" desc="Facturación y evolución" />
          <ModuleCard icon="📊" name="Rentabilidad" desc="Márgenes por familia" />
          <ModuleCard icon="📅" name="Calendario" desc="Promociones y agenda" />
        </div>
        <div className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 px-8 py-4 text-center w-full max-w-md">
          <p className="text-xl font-black text-blue-400">PANEL DE DIRECCIÓN</p>
          <p className="text-sm text-blue-300/70 mt-1">Todo llega aquí. El jefe solo mira aquí.</p>
        </div>
        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Funcionando</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500">En desarrollo</span>
          </div>
        </div>
      </div>
    ),
  },

  // 8 — DASHBOARD REAL
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">El producto real</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-3">
          10 segundos. Sabes todo.
        </p>
        <p className="text-base text-gray-400 text-center mb-6">
          Rojo = problemas. Verde = todo bien. Así de simple.
        </p>
        <div className="w-full rounded-xl bg-gray-800 p-5 space-y-3">
          <div className="rounded-lg bg-red-700 py-3 text-center">
            <p className="text-sm text-red-200 font-bold uppercase">Tienes</p>
            <p className="text-3xl font-black text-white">5 problemas importantes</p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { v: "3", l: "Incidencias", c: "bg-red-500/20 text-red-400 border-red-500/30" },
              { v: "3", l: "Pedidos", c: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
              { v: "1", l: "Recepciones", c: "bg-green-500/20 text-green-400 border-green-500/30" },
              { v: "1", l: "Vehículos", c: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
              { v: "2", l: "Entregas", c: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
            ].map((k, i) => (
              <div key={i} className={`rounded-lg border ${k.c} p-3 text-center`}>
                <p className="text-3xl font-black">{k.v}</p>
                <p className="text-xs font-bold uppercase mt-1 opacity-70">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { text: "Frigorífico Bosch: falta 1 unidad", tag: "Incidencia" },
              { text: "Isabel Navarro: entrega fallida", tag: "Entrega" },
              { text: "PED-002: recibido parcialmente", tag: "Pedido" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-700/50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <p className="text-sm text-gray-200 flex-1">{a.text}</p>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">{a.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs text-gray-500">Demo real funcionando — ten21.vercel.app</p>
        </div>
      </div>
    ),
  },

  // 9 — IMPACTO + SAAS
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Impacto y modelo</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-8">
          Resultados medibles. Negocio escalable.
        </p>
        {/* Impact */}
        <div className="grid grid-cols-3 gap-4 w-full mb-10">
          <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-center">
            <p className="text-5xl font-black text-red-600">-70%</p>
            <p className="text-sm font-bold text-red-800 mt-2">Tiempo perdido</p>
            <p className="text-xs text-red-600/60">De 26h a 8h/semana</p>
          </div>
          <div className="rounded-2xl bg-orange-50 border-2 border-orange-200 p-6 text-center">
            <p className="text-5xl font-black text-orange-600">0</p>
            <p className="text-sm font-bold text-orange-800 mt-2">Errores ocultos</p>
            <p className="text-xs text-orange-600/60">Detección automática</p>
          </div>
          <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-6 text-center">
            <p className="text-5xl font-black text-green-600">100%</p>
            <p className="text-sm font-bold text-green-800 mt-2">Trazabilidad</p>
            <p className="text-xs text-green-600/60">Quién, qué, cuándo</p>
          </div>
        </div>
        {/* SaaS model */}
        <div className="rounded-2xl bg-gray-900 p-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-white">+4.000</p>
              <p className="text-xs text-gray-400">tiendas en España</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-white">1</p>
              <p className="text-xs text-gray-400">plataforma</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-blue-400">Setup + €/mes</p>
              <p className="text-xs text-gray-400">por tienda</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 10 — CIERRE
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-3xl sm:text-5xl font-black text-white leading-tight">
          No vendemos automatizaciones.
        </p>
        <p className="text-3xl sm:text-5xl font-black text-blue-400 mt-3 leading-tight">
          Vendemos una forma de<br />dirigir mejor la empresa.
        </p>
        <p className="mt-8 text-lg text-gray-400 max-w-xl">
          Con menos trabajo, menos errores y más beneficio.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-black text-red-400">-70%</p>
            <p className="text-xs text-gray-500 mt-1">tiempo perdido</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-orange-400">0</p>
            <p className="text-xs text-gray-500 mt-1">errores ocultos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-green-400">100%</p>
            <p className="text-xs text-gray-500 mt-1">trazabilidad</p>
          </div>
        </div>
        <div className="mt-10">
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Ver la demo en vivo →
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          ten21.vercel.app — Funcionando. Probado. Listo.
        </p>
      </div>
    ),
  },
];

// ============================================================
// PAGE
// ============================================================

export default function PitchPage() {
  return (
    <div className="scroll-smooth">
      {slides.map((slide, i) => (
        <section
          key={i}
          className={`min-h-screen w-full ${slide.bg} flex items-center justify-center relative`}
        >
          {slide.content}
          <div className="absolute bottom-4 right-6">
            <span className={`text-xs font-mono ${
              slide.bg.includes("950") || slide.bg.includes("900") || slide.bg.includes("blue-600")
                ? "text-white/20" : "text-gray-300"
            }`}>
              {i + 1} / {slides.length}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
