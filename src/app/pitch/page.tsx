import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ten21 — Tu tienda, bajo control",
  description: "Sistema de automatización integral para tiendas de electrodomésticos",
};

const slides = [
  // 1 — APERTURA
  {
    bg: "bg-black",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-7xl font-black text-white leading-tight">
          ¿Cuánto dinero se ha perdido en tu tienda este año sin que nadie lo viera?
        </p>
        <p className="mt-10 text-lg text-gray-500">
          No por mala gestión. Sino porque nadie conecta la información.
        </p>
      </div>
    ),
  },

  // 2 — SITUACIÓN REAL
  {
    bg: "bg-gray-100",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-6xl font-black text-gray-900 text-center leading-tight">
          Lunes, 9:15.<br />Llega un camión.
        </p>
        <div className="mt-10 space-y-4 w-full max-w-lg">
          {[
            "Juan descarga con prisas. Apunta lo que puede.",
            "Tú llamas: \"¿Ha llegado todo?\"",
            "\"Sí, creo que sí.\"",
            "Una semana después, falta una pieza.",
          ].map((line, i) => (
            <p key={i} className={`text-lg ${i === 3 ? "font-bold text-red-700 mt-6" : "text-gray-700"}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
    ),
  },

  // 3 — PROBLEMA INVISIBLE
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-3xl sm:text-5xl font-black text-gray-900 text-center leading-tight mb-12">
          Lo que no se cruza, no se detecta.<br />
          Lo que no se detecta, se pierde.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { label: "Pedido", sub: "dice una cosa" },
            { label: "Albarán", sub: "dice otra" },
            { label: "Factura", sub: "dice otra" },
            { label: "Banco", sub: "cobra lo que sea" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-2xl text-red-300">✕</span>}
              <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-5 py-4 text-center w-[140px]">
                <p className="text-sm font-black text-gray-900">{item.label}</p>
                <p className="text-xs text-red-500 mt-1">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg font-semibold text-gray-500 text-center">
          Nadie compara nada. Y cada vez que pasa, se pierde dinero.
        </p>
      </div>
    ),
  },

  // 4 — TENSIÓN
  {
    bg: "bg-red-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-2xl mx-auto">
        <p className="text-5xl sm:text-7xl font-black text-white leading-tight">3</p>
        <p className="text-2xl sm:text-3xl font-black text-white mt-2">frigoríficos pedidos.</p>
        <div className="my-8 h-px w-32 bg-red-500/40 mx-auto" />
        <p className="text-2xl sm:text-3xl font-bold text-red-300">2 llegaron. Uno con un golpe.</p>
        <p className="text-2xl sm:text-3xl font-bold text-red-300 mt-2">Se pagaron 3.</p>
        <div className="my-8 h-px w-32 bg-red-500/40 mx-auto" />
        <p className="text-lg text-red-400">
          Nadie lo vio. Nadie lo reclamó. Se perdió.
        </p>
      </div>
    ),
  },

  // 5 — LA IDEA (alivio)
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
          ¿Y si cada parte de tu negocio estuviera vigilada automáticamente?
        </p>
        <div className="mt-10 space-y-3">
          <p className="text-lg text-blue-100">Sin instalar nada. Desde el navegador.</p>
          <p className="text-lg text-blue-100">Sin cambiar tu forma de trabajar.</p>
          <p className="text-lg text-blue-100">Se adapta a lo que ya haces.</p>
        </div>
      </div>
    ),
  },

  // 6 — FLOW COMPLETO
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">El sistema completo</p>
        <p className="text-3xl sm:text-4xl font-black text-white text-center mb-8">
          Del pedido al cobro. Todo conectado.
        </p>
        {[
          { title: "ENTRADA", color: "border-blue-500/30", accent: "text-blue-400", items: [
            { n: "Necesidad", s: "venta o stock" }, { n: "Pedido", s: "proveedor + coste" }, { n: "Albarán", s: "escaneo" }, { n: "Chequeo", s: "móvil" },
          ]},
          { title: "VERIFICACIÓN", color: "border-orange-500/30", accent: "text-orange-400", items: [
            { n: "Factura", s: "lectura auto" }, { n: "Cruce", s: "4 documentos" }, { n: "Coste", s: "esperado vs real" },
          ]},
          { title: "FINANZAS", color: "border-green-500/30", accent: "text-green-400", items: [
            { n: "Pagos", s: "previsión" }, { n: "Banco", s: "conciliación" }, { n: "Ventas", s: "control" }, { n: "Rentabilidad", s: "márgenes" },
          ]},
          { title: "DIRECCIÓN", color: "border-purple-500/30", accent: "text-purple-400", items: [
            { n: "Calendario", s: "automático" }, { n: "Base info", s: "histórico" }, { n: "Parte diario", s: "voz" }, { n: "PANEL", s: "control total" },
          ]},
        ].map((level, li) => (
          <div key={li} className={`w-full rounded-xl border ${level.color} bg-gray-900/50 p-3 mb-2`}>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${level.accent} w-28 text-right flex-shrink-0`}>{level.title}</span>
              <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                {level.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-1.5">
                    {ii > 0 && <span className={`text-xs ${level.accent} opacity-40`}>→</span>}
                    <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-center">
                      <p className="text-xs font-bold text-white leading-tight">{item.n}</p>
                      <p className="text-[9px] text-gray-500">{item.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <p className="mt-4 text-xs text-gray-600">15 piezas conectadas. Todo converge en el panel.</p>
      </div>
    ),
  },

  // 7 — AGENTES
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Vigilancia automática</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10">
          Cada parte del negocio tiene quien la vigile.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-3xl mb-6">
          {[
            { n: "Compras", s: "pedidos y costes", c: "border-blue-200 bg-blue-50" },
            { n: "Recepción", s: "pedido vs realidad", c: "border-green-200 bg-green-50" },
            { n: "Facturas", s: "lectura y validación", c: "border-purple-200 bg-purple-50" },
            { n: "Tesorería", s: "pagos y banco", c: "border-yellow-200 bg-yellow-50" },
            { n: "Ventas", s: "facturación", c: "border-cyan-200 bg-cyan-50" },
            { n: "Rentabilidad", s: "márgenes reales", c: "border-orange-200 bg-orange-50" },
            { n: "Agenda", s: "emails y fechas", c: "border-pink-200 bg-pink-50" },
            { n: "Operaciones", s: "entregas y GPS", c: "border-emerald-200 bg-emerald-50" },
          ].map((a, i) => (
            <div key={i} className={`rounded-xl border-2 ${a.c} p-4 text-center`}>
              <p className="text-sm font-black text-gray-900">{a.n}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{a.s}</p>
            </div>
          ))}
        </div>
        {/* Supervisor */}
        <div className="rounded-2xl border-2 border-gray-900 bg-gray-900 px-8 py-4 text-center">
          <p className="text-base font-black text-white">SUPERVISOR</p>
          <p className="text-xs text-gray-400 mt-0.5">Reúne todo · Prioriza · Resume · Avisa</p>
        </div>
        <p className="mt-6 text-sm text-gray-500 text-center">
          No sustituyen a nadie. Les quitan carga. Y evitan que las cosas se pierdan.
        </p>
      </div>
    ),
  },

  // 8 — MOMENTO WOW
  {
    bg: "bg-gray-50",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Ejemplo real</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-8">
          Paso a paso. Sin inventar nada.
        </p>
        <div className="w-full space-y-2">
          {[
            { t: "9:00", text: "Pedido: 3 frigoríficos + 2 lavavajillas", c: "border-blue-200 bg-blue-50" },
            { t: "9:15", text: "Llega el camión. Juan abre la app.", c: "border-blue-200 bg-blue-50" },
            { t: "9:18", text: "Marca: 2 frigoríficos (1 con golpe). 0 lavavajillas.", c: "border-orange-200 bg-orange-50" },
            { t: "9:19", text: "El sistema crea 3 incidencias automáticas.", c: "border-red-200 bg-red-50" },
            { t: "9:19", text: "Detecta que la factura no cuadrará.", c: "border-red-200 bg-red-50" },
            { t: "9:20", text: "Pedido pasa a \"Parcial\".", c: "border-red-200 bg-red-50" },
            { t: "9:30", text: "María abre el panel desde casa. Ve todo.", c: "border-green-200 bg-green-50" },
            { t: "9:32", text: "Llama al proveedor. Con los datos delante.", c: "border-green-200 bg-green-50" },
            { t: "9:35", text: "Marca como \"Notificada\". Queda registrado.", c: "border-green-200 bg-green-50" },
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl border-2 ${step.c} px-4 py-2.5`}>
              <span className="text-xs font-mono font-bold text-gray-400 w-10 flex-shrink-0">{step.t}</span>
              <p className="text-sm font-semibold text-gray-900">{step.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm font-bold text-gray-700 text-center">
          20 minutos. Sin papel. Sin llamar al almacén. Sin perder nada.
        </p>
      </div>
    ),
  },

  // 9 — DASHBOARD + PARTE DIARIO
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-3xl sm:text-5xl font-black text-white text-center mb-2">
          El jefe no busca. Mira. Y decide.
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">Cada mañana. Desde cualquier sitio.</p>
        <div className="w-full rounded-2xl bg-gray-800 p-4 space-y-2.5 shadow-2xl">
          <div className="rounded-xl bg-red-700 py-3 text-center">
            <p className="text-xs text-red-200 font-bold uppercase">Tienes</p>
            <p className="text-3xl font-black text-white mt-0.5">5 problemas importantes</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { v: "3", l: "Incid.", c: "bg-red-500/20 text-red-400 border-red-500/20" },
              { v: "3", l: "Pedidos", c: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
              { v: "1", l: "Recep.", c: "bg-green-500/20 text-green-400 border-green-500/20" },
              { v: "1", l: "Vehic.", c: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
              { v: "2", l: "Entreg.", c: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
            ].map((k, i) => (
              <div key={i} className={`rounded-lg border ${k.c} p-2 text-center`}>
                <p className="text-2xl font-black">{k.v}</p>
                <p className="text-[9px] font-bold uppercase opacity-70">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {[
              "Frigorífico Bosch: falta 1 unidad",
              "Factura no cuadra con albarán",
              "Isabel Navarro: entrega fallida",
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg bg-gray-700/40 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-gray-300">{a}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-gray-700/30 p-2.5">
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Hoy</p>
              {["REC-003 ● OK", "ENT-001 ● En ruta"].map((r, i) => (
                <p key={i} className="text-[11px] text-gray-400">{r}</p>
              ))}
            </div>
            <div className="rounded-lg bg-gray-700/30 p-2.5">
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">🔊 Parte diario</p>
              <p className="text-[11px] text-gray-400 italic">
                &quot;Hoy tienes 3 incidencias abiertas y una entrega fallida...&quot;
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-600">Esto no es un diseño. Es el sistema real.</p>
      </div>
    ),
  },

  // 10 — CIERRE
  {
    bg: "bg-black",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-3xl mx-auto">
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight">
          Esto ya te está pasando.
        </p>
        <p className="text-4xl sm:text-6xl font-black text-blue-400 mt-4 leading-tight">
          La diferencia es<br />si lo controlas o no.
        </p>
        <div className="mt-10 space-y-3 text-base text-gray-400">
          <p>Funciona desde el navegador. Sin instalar nada.</p>
          <p>Se adapta a cómo trabajas hoy.</p>
          <p>Cada parte del negocio vigilada automáticamente.</p>
        </div>
        <div className="mt-10 h-px w-24 bg-gray-800 mx-auto" />
        <p className="mt-8 text-xl font-bold text-white">
          ¿Lo vemos funcionando con tus datos?
        </p>
        <p className="mt-6 text-xs text-gray-700">ten21.vercel.app</p>
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
            <span className={`text-xs font-mono ${
              slide.bg === "bg-black" || slide.bg.includes("950") || slide.bg.includes("900") || slide.bg.includes("blue-600") || slide.bg.includes("red-950")
                ? "text-white/10" : "text-gray-300"
            }`}>
              {i + 1}/{slides.length}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
