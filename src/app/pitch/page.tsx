import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ten21 — Tu tienda, bajo control",
  description: "Sistema de automatización para tiendas de electrodomésticos",
};

// ============================================================
// COMPONENTS
// ============================================================

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500 w-20 text-right">{label}</span>
      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full flex items-center justify-end pr-3 transition-all duration-1000`} style={{ width: `${pct}%` }}>
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

function ProblemSolution({ problem, solution, saving }: { problem: string; solution: string; saving: string }) {
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex-1 rounded-xl bg-red-50 border-2 border-red-200 p-5">
        <p className="text-xs font-bold uppercase text-red-400 mb-2">Problema</p>
        <p className="text-base font-semibold text-red-900">{problem}</p>
      </div>
      <div className="flex items-center">
        <span className="text-2xl text-gray-300">→</span>
      </div>
      <div className="flex-1 rounded-xl bg-green-50 border-2 border-green-200 p-5">
        <p className="text-xs font-bold uppercase text-green-500 mb-2">Solución</p>
        <p className="text-base font-semibold text-green-900">{solution}</p>
      </div>
      <div className="flex items-center">
        <div className="rounded-full bg-blue-600 px-4 py-2 text-center">
          <p className="text-sm font-black text-white whitespace-nowrap">{saving}</p>
        </div>
      </div>
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
        <p className="text-5xl sm:text-8xl font-black text-white tracking-tight leading-tight">
          Dirige tu empresa<br />desde una sola pantalla
        </p>
        <p className="mt-6 text-xl text-gray-400 font-medium">
          Menos errores. Menos trabajo. Más control.
        </p>
        <div className="mt-12 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <p className="text-sm text-gray-500 font-mono">ten21</p>
        </div>
      </div>
    ),
  },

  // 2 — EL COSTE DEL CAOS
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4">El coste real</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          ¿Cuánto te cuesta no tener control?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-10">
          <StatCard value="8" unit="h" label="Horas/semana persiguiendo información" color="bg-red-50 text-red-900" />
          <StatCard value="3" unit="%" label="Errores de recepción no detectados" color="bg-orange-50 text-orange-900" />
          <StatCard value="2.400" unit="€" label="Pérdida media anual por errores" color="bg-red-100 text-red-900" />
          <StatCard value="5" unit="h" label="Horas/semana en llamadas al almacén" color="bg-orange-50 text-orange-900" />
        </div>
        <p className="text-lg text-gray-500 text-center">
          Datos estimados para una tienda media de electrodomésticos con 2-5 empleados
        </p>
      </div>
    ),
  },

  // 3 — TIEMPO PERDIDO (gráfico)
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Tiempo del jefe</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-4">
          ¿Dónde se van las horas?
        </p>
        <p className="text-lg text-gray-500 text-center mb-10">Horas semanales estimadas en tareas de control</p>
        <div className="w-full space-y-4">
          <Bar value={8} max={10} color="bg-red-500" label="Llamadas" />
          <Bar value={6} max={10} color="bg-orange-500" label="Revisar" />
          <Bar value={5} max={10} color="bg-yellow-500" label="Comprobar" />
          <Bar value={4} max={10} color="bg-amber-500" label="Reclamar" />
          <Bar value={3} max={10} color="bg-red-400" label="Buscar" />
        </div>
        <div className="mt-8 rounded-xl bg-red-600 px-8 py-4 text-center">
          <p className="text-3xl font-black text-white">26 horas/semana</p>
          <p className="text-sm text-red-200">dedicadas a perseguir información, no a vender</p>
        </div>
      </div>
    ),
  },

  // 4 — PROBLEMA → SOLUCIÓN
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">La solución</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10">
          Cada problema tiene una solución automática
        </p>
        <div className="w-full space-y-4">
          <ProblemSolution
            problem="Llamo al almacén para saber si llegó el pedido"
            solution="Lo ves en el panel en 10 segundos"
            saving="-8h/sem"
          />
          <ProblemSolution
            problem="Nadie detecta que falta mercancía"
            solution="El sistema compara automáticamente"
            saving="-2.400€/año"
          />
          <ProblemSolution
            problem="Reclamo al proveedor sin datos"
            solution="Trazabilidad completa de cada incidencia"
            saving="100% trazable"
          />
          <ProblemSolution
            problem="No sé si la furgoneta ha salido"
            solution="GPS + estado en tiempo real"
            saving="-5h/sem"
          />
        </div>
      </div>
    ),
  },

  // 5 — FLUJO AUTOMÁTICO
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-4">El flujo</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          Todo conectado. Todo automático.
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {[
            { label: "Pedido", sub: "Lo creas tú" },
            { label: "Recepción", sub: "El almacén confirma" },
            { label: "Comprobación", sub: "Automática" },
            { label: "Incidencia", sub: "Automática" },
            { label: "Panel", sub: "Tú decides" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <span className="text-2xl sm:text-3xl text-blue-300 font-light">→</span>}
              <div className="rounded-xl bg-white/15 backdrop-blur px-4 sm:px-5 py-3 text-center min-w-[100px]">
                <p className="text-sm font-bold text-white">{step.label}</p>
                <p className="text-xs text-blue-200 mt-0.5">{step.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xl text-blue-100 font-semibold text-center">
          Si algo falla, el sistema lo detecta solo.<br />
          El jefe no tiene que preguntar nada.
        </p>
      </div>
    ),
  },

  // 6 — AHORRO TOTAL
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Impacto</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          ¿Qué ganas con Ten21?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-6xl font-black text-red-400">-70%</p>
            <p className="text-base font-bold text-red-300 mt-3">Menos tiempo<br />persiguiendo información</p>
            <p className="text-xs text-red-400/60 mt-2">De 26h a 8h semanales</p>
          </div>
          <div className="rounded-2xl border-2 border-orange-500/30 bg-orange-500/10 p-8 text-center">
            <p className="text-6xl font-black text-orange-400">0</p>
            <p className="text-base font-bold text-orange-300 mt-3">Errores de recepción<br />sin detectar</p>
            <p className="text-xs text-orange-400/60 mt-2">Detección automática al 100%</p>
          </div>
          <div className="rounded-2xl border-2 border-green-500/30 bg-green-500/10 p-8 text-center">
            <p className="text-6xl font-black text-green-400">100%</p>
            <p className="text-base font-bold text-green-300 mt-3">Trazabilidad<br />de incidencias</p>
            <p className="text-xs text-green-400/60 mt-2">Quién, qué, cuándo, cómo</p>
          </div>
        </div>
        <p className="mt-10 text-lg text-gray-500 text-center">
          Estimación basada en una tienda con 2-5 empleados y 50-100 pedidos/mes
        </p>
      </div>
    ),
  },

  // 7 — DASHBOARD REAL
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">El producto</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-3">
          10 segundos. Sabes todo.
        </p>
        <p className="text-lg text-gray-400 text-center mb-8">
          Rojo = hay problemas. Verde = todo bien. Así de simple.
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
              { text: "Frigorifico Bosch: falta 1 unidad", tag: "Incidencia" },
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

  // 8 — VISIÓN SAAS
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Modelo de negocio</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          Escalable a cientos de tiendas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-10">
          <div className="rounded-xl border-2 border-gray-200 p-6 text-center">
            <p className="text-3xl mb-2">🏪</p>
            <p className="text-lg font-black text-gray-900">1 plataforma</p>
            <p className="text-sm text-gray-500">Mismo código, misma app</p>
          </div>
          <div className="rounded-xl border-2 border-gray-200 p-6 text-center">
            <p className="text-3xl mb-2">🔒</p>
            <p className="text-lg font-black text-gray-900">Datos aislados</p>
            <p className="text-sm text-gray-500">Cada tienda ve solo lo suyo</p>
          </div>
          <div className="rounded-xl border-2 border-gray-200 p-6 text-center">
            <p className="text-3xl mb-2">🌐</p>
            <p className="text-lg font-black text-gray-900">Cero instalación</p>
            <p className="text-sm text-gray-500">Abren el navegador y listo</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900 p-8 w-full text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Modelo</p>
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-3xl font-black text-white">Setup</p>
              <p className="text-sm text-gray-400">Implantación inicial</p>
            </div>
            <p className="text-3xl text-gray-600">+</p>
            <div>
              <p className="text-3xl font-black text-blue-400">€/mes</p>
              <p className="text-sm text-gray-400">Cuota mensual por tienda</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 9 — PÚBLICO OBJETIVO
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Mercado</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          ¿Para quién es?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
          {[
            { title: "Tiendas de electrodomésticos", desc: "Tien21, Expert, Milar, independientes" },
            { title: "Tiendas de muebles", desc: "Con almacén, reparto y pedidos a proveedor" },
            { title: "Negocios familiares", desc: "2-10 empleados, el jefe en todo" },
            { title: "Franquicias y grupos", desc: "Mismo sistema para toda la red" },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border-2 border-gray-200 bg-white p-5">
              <p className="text-lg font-black text-gray-900">{t.title}</p>
              <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-5xl font-black text-blue-600">+4.000</p>
          <p className="text-base text-gray-500 mt-1">tiendas de electrodomésticos en España</p>
        </div>
      </div>
    ),
  },

  // 10 — CIERRE
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
          No vendemos software.
        </p>
        <p className="text-4xl sm:text-6xl font-black text-blue-400 mt-2 leading-tight">
          Vendemos control.
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
        <div className="mt-12">
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
