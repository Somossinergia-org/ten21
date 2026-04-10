import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ten21 — Tu tienda, bajo control",
  description: "Sistema de automatización para tiendas de electrodomésticos",
};

const slides = [
  // SLIDE 1 — PORTADA
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <p className="text-6xl sm:text-8xl font-black text-white tracking-tight">
          Tu tienda,<br />bajo control
        </p>
        <p className="mt-6 text-xl sm:text-2xl text-gray-400 font-medium">
          Sistema de automatización para tiendas de electrodomésticos
        </p>
        <div className="mt-12 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <p className="text-sm text-gray-500 font-mono">ten21</p>
        </div>
      </div>
    ),
  },
  // SLIDE 2 — EL PROBLEMA
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-red-500 mb-6">El problema</p>
        <p className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
          El jefe tiene que<br />estar en todo
        </p>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl mb-2">📞</p>
            <p className="text-lg font-bold text-gray-900">¿Ha llegado el pedido?</p>
          </div>
          <div>
            <p className="text-4xl mb-2">📋</p>
            <p className="text-lg font-bold text-gray-900">¿Falta algo?</p>
          </div>
          <div>
            <p className="text-4xl mb-2">🚛</p>
            <p className="text-lg font-bold text-gray-900">¿Salió la furgoneta?</p>
          </div>
        </div>
        <p className="mt-10 text-lg text-gray-500">
          Todo depende de llamadas, memoria y papel.
        </p>
      </div>
    ),
  },
  // SLIDE 3 — CÓMO FUNCIONA HOY
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Hoy</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-12">
          La información no se conecta
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[
            { label: "Pedido", sub: "Excel", color: "border-gray-300" },
            { label: "Albarán", sub: "Papel", color: "border-gray-300" },
            { label: "¿Error?", sub: "Nadie lo ve", color: "border-red-400" },
            { label: "Entrega", sub: "Sin control", color: "border-gray-300" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              {i > 0 && <span className="text-3xl text-red-300">- - -</span>}
              <div className={`rounded-xl border-2 ${item.color} bg-white px-6 py-4 text-center min-w-[140px]`}>
                <p className="text-lg font-bold text-gray-900">{item.label}</p>
                <p className="text-sm text-red-500 font-medium mt-1">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg text-red-600 font-semibold">
          Los errores no se detectan. El dinero se pierde.
        </p>
      </div>
    ),
  },
  // SLIDE 4 — LA IDEA
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-6">La solución</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          Un flujo que se controla solo
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            "Pedido",
            "Recepción",
            "Comprobación\nautomática",
            "Incidencia\nautomática",
            "Panel\nde control",
          ].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-3xl text-blue-300">→</span>}
              <div className="rounded-xl bg-white/20 backdrop-blur px-5 py-3 text-center min-w-[120px]">
                <p className="text-sm font-bold text-white whitespace-pre-line">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xl text-blue-100 font-medium text-center">
          Si algo falla, el sistema lo detecta solo.
        </p>
      </div>
    ),
  },
  // SLIDE 5 — QUÉ HACE
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">El sistema</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-12">
          5 módulos. Todo conectado.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
          {[
            { name: "Compras", desc: "Pedidos a proveedor", color: "border-blue-300 bg-blue-50" },
            { name: "Recepción", desc: "Comparación automática", color: "border-green-300 bg-green-50" },
            { name: "Incidencias", desc: "Detección automática", color: "border-red-300 bg-red-50" },
            { name: "Entregas", desc: "Vehículos y GPS", color: "border-yellow-300 bg-yellow-50" },
          ].map((m, i) => (
            <div key={i} className={`rounded-xl border-2 ${m.color} p-5 text-center`}>
              <p className="text-lg font-black text-gray-900">{m.name}</p>
              <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border-2 border-gray-900 bg-gray-900 px-8 py-4 text-center">
          <p className="text-xl font-black text-white">DASHBOARD</p>
          <p className="text-sm text-gray-400">Control total en 10 segundos</p>
        </div>
      </div>
    ),
  },
  // SLIDE 6 — EJEMPLO REAL
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Ejemplo real</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10">
          Pedimos 3 frigoríficos
        </p>
        <div className="space-y-4 w-full">
          {[
            { step: "1", text: "Pedimos 3 frigoríficos al proveedor", color: "bg-blue-50 border-blue-200" },
            { step: "2", text: "Llegan 2. Uno tiene un golpe.", color: "bg-orange-50 border-orange-200" },
            { step: "3", text: "El sistema detecta: \"Falta 1\" + \"1 dañado\"", color: "bg-red-50 border-red-300" },
            { step: "4", text: "El jefe lo ve en el panel. Sin llamar a nadie.", color: "bg-green-50 border-green-300" },
          ].map((s) => (
            <div key={s.step} className={`flex items-center gap-4 rounded-xl border-2 ${s.color} px-5 py-4`}>
              <span className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-lg">
                {s.step}
              </span>
              <p className="text-lg font-semibold text-gray-900">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // SLIDE 7 — DASHBOARD
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Dashboard</p>
        <p className="text-4xl sm:text-5xl font-black text-white text-center mb-4">
          10 segundos. Sabes todo.
        </p>
        <p className="text-lg text-gray-400 text-center mb-8">
          Si está en verde, todo bien. Si está en rojo, hay algo que mirar.
        </p>
        {/* Simulated dashboard */}
        <div className="w-full rounded-xl bg-gray-800 p-6 space-y-4">
          <div className="rounded-lg bg-red-600 py-3 text-center">
            <p className="text-2xl font-black text-white">TIENES 5 PROBLEMAS IMPORTANTES</p>
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
        </div>
        <p className="mt-4 text-sm text-gray-500">ten21.vercel.app — demo real funcionando</p>
      </div>
    ),
  },
  // SLIDE 8 — BENEFICIOS
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Resultado</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-12">
          ¿Qué ganas?
        </p>
        <div className="grid grid-cols-3 gap-6 w-full">
          {[
            { title: "MENOS\nERRORES", desc: "El sistema los detecta solo", color: "bg-red-50 border-red-300 text-red-900", accent: "text-red-600" },
            { title: "MENOS\nTRABAJO", desc: "No cruzas datos a mano", color: "bg-orange-50 border-orange-300 text-orange-900", accent: "text-orange-600" },
            { title: "MÁS\nCONTROL", desc: "Todo en un solo panel", color: "bg-green-50 border-green-300 text-green-900", accent: "text-green-600" },
          ].map((b, i) => (
            <div key={i} className={`rounded-2xl border-2 ${b.color} p-8 text-center`}>
              <p className={`text-2xl font-black whitespace-pre-line ${b.accent}`}>{b.title}</p>
              <p className="text-sm text-gray-600 mt-3">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // SLIDE 9 — VISIÓN SAAS
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-6">Visión</p>
        <p className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-12">
          No es solo para una tienda
        </p>
        <div className="flex items-end justify-center gap-6 mb-8">
          {["Murcia", "Cartagena", "Lorca"].map((city) => (
            <div key={city} className="text-center">
              <div className="rounded-xl border-2 border-gray-300 bg-white px-6 py-4">
                <p className="text-2xl mb-1">🏪</p>
                <p className="text-sm font-bold text-gray-900">{city}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-4">
          <div className="flex gap-6">
            <span className="text-gray-300 text-2xl">↓</span>
            <span className="text-gray-300 text-2xl">↓</span>
            <span className="text-gray-300 text-2xl">↓</span>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-900 px-10 py-5 text-center">
          <p className="text-xl font-black text-white">MISMA PLATAFORMA</p>
          <p className="text-sm text-gray-400 mt-1">Cada tienda con sus datos aislados. Cero instalación.</p>
        </div>
        <p className="mt-8 text-lg text-gray-600 font-medium text-center">
          Implantación inicial + cuota mensual.<br />
          Abren el navegador y a trabajar.
        </p>
      </div>
    ),
  },
  // SLIDE 10 — CIERRE
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
        <div className="mt-10 space-y-2">
          <p className="text-lg text-gray-400">
            Cada error detectado es dinero recuperado.
          </p>
          <p className="text-lg text-gray-400">
            Cada minuto ahorrado es un minuto para vender.
          </p>
        </div>
        <div className="mt-12 rounded-full bg-blue-600 px-8 py-3">
          <p className="text-sm font-bold text-white tracking-wider">
            ten21.vercel.app
          </p>
        </div>
      </div>
    ),
  },
];

export default function PitchPage() {
  return (
    <div className="scroll-smooth">
      {slides.map((slide, i) => (
        <section
          key={i}
          className={`min-h-screen w-full ${slide.bg} flex items-center justify-center relative`}
        >
          {slide.content}
          {/* Slide number */}
          <div className="absolute bottom-4 right-6">
            <span className={`text-xs font-mono ${slide.bg === "bg-gray-950" || slide.bg === "bg-gray-900" || slide.bg === "bg-blue-600" ? "text-white/20" : "text-gray-300"}`}>
              {i + 1} / {slides.length}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
