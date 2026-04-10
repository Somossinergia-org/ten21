import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ten21 — Todo tu negocio en una sola pantalla",
  description: "Sistema de automatización integral para tiendas de electrodomésticos",
};

// ============================================================
// SLIDES
// ============================================================

const slides = [
  // 1 — PORTADA
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <span className="inline-block rounded-full bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-8">
          Automatización integral para tiendas
        </span>
        <p className="text-5xl sm:text-8xl font-black text-white tracking-tight leading-[0.9]">
          Todo tu negocio.
        </p>
        <p className="text-5xl sm:text-8xl font-black text-blue-400 tracking-tight leading-[0.9] mt-2">
          Una sola pantalla.
        </p>
        <p className="mt-8 text-lg text-gray-400 max-w-lg">
          Del pedido al cobro. Sin errores. Sin trabajo manual.
        </p>
        <div className="mt-10 flex items-center gap-6">
          <Link href="/login" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            Ver demo en vivo →
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Producto real</span>
          </div>
        </div>
      </div>
    ),
  },

  // 2 — EL PROBLEMA (6 cajas)
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4">La realidad</p>
        <p className="text-3xl sm:text-5xl font-black text-gray-900 text-center mb-10">
          El negocio funciona a base de personas.<br />Y las personas fallan.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {[
            { icon: "📞", title: "El jefe llama", sub: "15 veces al día" },
            { icon: "📋", title: "Papeles que", sub: "nadie cruza" },
            { icon: "📦", title: "Llega mercancía", sub: "y nadie comprueba" },
            { icon: "💰", title: "Se pagan facturas", sub: "sin verificar" },
            { icon: "🚛", title: "Entregas sin", sub: "control real" },
            { icon: "📊", title: "No se sabe si", sub: "se gana o se pierde" },
          ].map((p, i) => (
            <div key={i} className="rounded-xl border-2 border-red-100 bg-red-50 p-5 text-center">
              <p className="text-3xl mb-2">{p.icon}</p>
              <p className="text-sm font-black text-gray-900">{p.title}</p>
              <p className="text-xs text-red-600 font-medium mt-0.5">{p.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-base font-bold text-red-600">
          Cada problema cuesta tiempo y dinero. Todos los días.
        </p>
      </div>
    ),
  },

  // 3 — CÓMO FUNCIONA HOY (caos)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Hoy</p>
        <p className="text-3xl sm:text-5xl font-black text-white text-center mb-10">
          Nada se conecta. Todo se pierde.
        </p>
        {/* Top row */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
          {[
            { label: "Pedido", sub: "Excel" },
            { label: "Albarán", sub: "Papel" },
            { label: "Factura", sub: "Email" },
            { label: "Banco", sub: "Otro programa" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-xl text-red-500/40 font-mono">- - -</span>}
              <div className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-3 text-center min-w-[110px]">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-red-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Center X */}
        <div className="my-4 rounded-full bg-red-600 px-6 py-2">
          <p className="text-sm font-black text-white">SIN CONEXIÓN</p>
        </div>
        {/* Bottom row */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { label: "Venta", sub: "Otro sistema" },
            { label: "Reparto", sub: "WhatsApp" },
            { label: "Reclamación", sub: "Memoria" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-xl text-red-500/40 font-mono">- - -</span>}
              <div className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-3 text-center min-w-[110px]">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-red-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-base text-gray-400 text-center">
          La información existe. Pero nadie la conecta.
        </p>
      </div>
    ),
  },

  // 4 — LA IDEA (motor central)
  {
    bg: "bg-blue-600",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-6">La solución</p>
        <p className="text-4xl sm:text-6xl font-black text-white leading-tight mb-10">
          ¿Y si todo estuviera<br />conectado y se controlara solo?
        </p>
        {/* Central engine */}
        <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 px-8 py-5 mb-8">
          <p className="text-lg font-black text-white">MOTOR AUTOMÁTICO</p>
          <p className="text-sm text-blue-100 mt-1">Cruza · Valida · Detecta · Avisa</p>
        </div>
        {/* Connected modules */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {["Compras", "Recepción", "Finanzas", "Reparto", "Ventas"].map((m) => (
            <div key={m} className="flex items-center gap-2">
              <span className="text-blue-300">↑</span>
              <div className="rounded-full bg-white/15 px-4 py-2">
                <p className="text-xs font-bold text-white">{m}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-lg text-blue-100 font-semibold">
          Un sistema que conecta toda la operativa.<br />Si algo falla, lo detecta solo.
        </p>
      </div>
    ),
  },

  // 5 — MAPA COMPLETO (15 piezas, 4 niveles)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-6 max-w-5xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3">Visión completa</p>
        <p className="text-2xl sm:text-4xl font-black text-white text-center mb-6">
          15 piezas conectadas
        </p>
        {/* 4 levels */}
        {[
          { title: "ENTRADA", color: "border-blue-500/30 bg-blue-500/5", titleColor: "text-blue-400", items: [
            { name: "Venta", sub: "necesidad" }, { name: "Pedido", sub: "proveedor + coste" }, { name: "Albarán", sub: "escaneo auto" }, { name: "Chequeo", sub: "móvil" }
          ]},
          { title: "PROCESADO", color: "border-orange-500/30 bg-orange-500/5", titleColor: "text-orange-400", items: [
            { name: "Factura", sub: "lectura auto" }, { name: "Cruce", sub: "4 documentos" }, { name: "Coste", sub: "esperado vs real" }
          ]},
          { title: "FINANZAS", color: "border-green-500/30 bg-green-500/5", titleColor: "text-green-400", items: [
            { name: "Pagos", sub: "previsión auto" }, { name: "Banco", sub: "conciliación" }, { name: "Ventas", sub: "lectura auto" }, { name: "Rentabilidad", sub: "márgenes" }
          ]},
          { title: "INTELIGENCIA", color: "border-purple-500/30 bg-purple-500/5", titleColor: "text-purple-400", items: [
            { name: "Calendario", sub: "detección auto" }, { name: "Base info", sub: "histórico" }, { name: "Parte diario", sub: "resumen voz" }, { name: "PANEL", sub: "control total" }
          ]},
        ].map((level, li) => (
          <div key={li} className={`w-full rounded-xl border ${level.color} p-3 mb-2`}>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${level.titleColor} w-24 text-right`}>{level.title}</span>
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {level.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    {ii > 0 && <span className={`text-sm ${level.titleColor} opacity-50`}>→</span>}
                    <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-center">
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <p className="mt-4 text-sm text-gray-500 text-center">Todo fluye hacia el panel. El jefe solo mira ahí.</p>
      </div>
    ),
  },

  // 6 — FLUJO EN ACCIÓN (timeline)
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">En acción</p>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-8">
          Lunes, 9:15. Llega un camión.
        </p>
        <div className="w-full space-y-2">
          {[
            { n: "①", text: "Se hizo un pedido: 3 frigoríficos, 2 hornos, 2 lavavajillas", color: "border-blue-200 bg-blue-50" },
            { n: "②", text: "Llega mercancía. Juan abre la app y marca lo que ha llegado.", color: "border-blue-200 bg-blue-50" },
            { n: "③", text: "El sistema cruza: pedido vs albarán vs chequeo vs factura", color: "border-orange-200 bg-orange-50" },
            { n: "④", text: "Detecta: falta 1 frigorífico, 1 con golpe, lavavajillas no llegaron", color: "border-red-300 bg-red-50" },
            { n: "⑤", text: "Crea 3 incidencias automáticas. Alerta de coste diferente.", color: "border-red-300 bg-red-50" },
            { n: "⑥", text: "Genera previsión de pago. Concilia con el banco.", color: "border-green-200 bg-green-50" },
            { n: "⑦", text: "La jefa abre el panel desde casa. Ve todo. Llama al proveedor CON DATOS.", color: "border-green-300 bg-green-50" },
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl border-2 ${step.color} px-4 py-3`}>
              <span className="text-2xl font-black text-gray-400 w-8 text-center">{step.n}</span>
              <p className="text-sm font-semibold text-gray-900 flex-1">{step.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-bold text-gray-900 text-center">
          20 minutos. Sin papel. Sin llamar. Sin perder nada.
        </p>
      </div>
    ),
  },

  // 7 — CRUCE DOCUMENTAL (4 documentos)
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-orange-400 mb-4">Detección automática</p>
        <p className="text-3xl sm:text-4xl font-black text-white mb-10">
          Cruza 4 documentos. Detecta todo.
        </p>
        {/* 4 corners → center */}
        <div className="relative w-full max-w-lg mx-auto">
          {/* Top row */}
          <div className="flex justify-between mb-4">
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 px-5 py-3 text-center w-[45%]">
              <p className="text-sm font-black text-blue-400">PEDIDO</p>
              <p className="text-xs text-blue-300/60">Lo que pediste</p>
            </div>
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 px-5 py-3 text-center w-[45%]">
              <p className="text-sm font-black text-purple-400">FACTURA</p>
              <p className="text-xs text-purple-300/60">Lo que te cobran</p>
            </div>
          </div>
          {/* Arrows */}
          <div className="flex justify-center gap-20 text-gray-600 text-xl my-1">
            <span>↘</span><span>↙</span>
          </div>
          {/* Center engine */}
          <div className="rounded-2xl bg-orange-500/20 border-2 border-orange-500/40 px-6 py-4 mx-auto w-[70%]">
            <p className="text-lg font-black text-orange-400">MOTOR DE CRUCE</p>
            <p className="text-xs text-orange-300/60">Automático · Instantáneo</p>
          </div>
          {/* Arrows */}
          <div className="flex justify-center gap-20 text-gray-600 text-xl my-1">
            <span>↗</span><span>↖</span>
          </div>
          {/* Bottom row */}
          <div className="flex justify-between mt-4">
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-5 py-3 text-center w-[45%]">
              <p className="text-sm font-black text-green-400">ALBARÁN</p>
              <p className="text-xs text-green-300/60">Lo que envía el proveedor</p>
            </div>
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-5 py-3 text-center w-[45%]">
              <p className="text-sm font-black text-yellow-400">CHEQUEO</p>
              <p className="text-xs text-yellow-300/60">Lo que hay realmente</p>
            </div>
          </div>
        </div>
        {/* Result */}
        <div className="mt-8 rounded-xl bg-red-500/10 border border-red-500/30 px-6 py-3 inline-block">
          <p className="text-sm font-black text-red-400">SI HAY DIFERENCIA → Incidencia auto · Alerta coste · Aviso al jefe</p>
        </div>
        <p className="mt-4 text-sm text-gray-500">Cuatro fuentes. Un cruce. Cero errores ocultos.</p>
      </div>
    ),
  },

  // 8 — DASHBOARD
  {
    bg: "bg-gray-900",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">El producto real</p>
        <p className="text-3xl sm:text-5xl font-black text-white text-center mb-2">
          10 segundos. Sabe todo.
        </p>
        <p className="text-sm text-gray-400 mb-6">Cada mañana. Desde cualquier sitio. Sin llamar a nadie.</p>
        <div className="w-full rounded-2xl bg-gray-800 p-4 space-y-2.5 shadow-2xl">
          <div className="rounded-xl bg-red-700 py-3 text-center">
            <p className="text-xs text-red-200 font-bold uppercase">Tienes</p>
            <p className="text-3xl font-black text-white">5 problemas importantes</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { v: "3", l: "Incidencias", c: "bg-red-500/20 text-red-400 border-red-500/20" },
              { v: "3", l: "Pedidos", c: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
              { v: "1", l: "Recepciones", c: "bg-green-500/20 text-green-400 border-green-500/20" },
              { v: "1", l: "Vehículos", c: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
              { v: "2", l: "Entregas", c: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
            ].map((k, i) => (
              <div key={i} className={`rounded-lg border ${k.c} p-2.5 text-center`}>
                <p className="text-2xl font-black">{k.v}</p>
                <p className="text-[10px] font-bold uppercase opacity-70">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {[
              "Frigorífico Bosch: falta 1 unidad",
              "Factura ALB-88102 no cuadra con albarán",
              "Isabel Navarro: entrega fallida",
              "PED-002: recibido parcialmente",
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg bg-gray-700/40 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-gray-300 flex-1">{a}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-gray-700/30 p-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hoy en tienda</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-[11px] text-gray-300">REC-003 Completada</span></div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /><span className="text-[11px] text-gray-300">ENT-001 En ruta</span></div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[11px] text-gray-300">ENT-002 Asignada</span></div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-700/30 p-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Reciente</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gray-500" /><span className="text-[11px] text-gray-300">PED-005 Borrador</span></div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /><span className="text-[11px] text-gray-300">REC-002 Con incidencias</span></div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /><span className="text-[11px] text-gray-300">INC-003 Registrada</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs text-gray-500">Esto no es un diseño. Es el sistema real.</p>
        </div>
      </div>
    ),
  },

  // 9 — BENEFICIOS + ROI
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600 mb-4">Resultado</p>
        <p className="text-3xl sm:text-5xl font-black text-gray-900 text-center mb-8">
          ¿Qué gana el negocio?
        </p>
        <div className="grid grid-cols-3 gap-5 w-full mb-8">
          {[
            { title: "MENOS\nERRORES", desc: "El sistema los detecta automáticamente cruzando 4 documentos", color: "border-red-300 bg-red-50", accent: "text-red-600" },
            { title: "MENOS\nTRABAJO", desc: "No cruzas datos a mano. No llamas. No buscas papeles.", color: "border-orange-300 bg-orange-50", accent: "text-orange-600" },
            { title: "MÁS\nCONTROL", desc: "Todo en un panel. En tiempo real. Desde cualquier sitio.", color: "border-green-300 bg-green-50", accent: "text-green-600" },
          ].map((b, i) => (
            <div key={i} className={`rounded-2xl border-2 ${b.color} p-6 text-center`}>
              <p className={`text-2xl font-black whitespace-pre-line ${b.accent}`}>{b.title}</p>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 w-full mb-6">
          {[
            { v: "-88%", l: "tiempo perdido", c: "text-red-600" },
            { v: "3.180€", l: "ahorro anual", c: "text-green-600" },
            { v: "0", l: "errores ocultos", c: "text-orange-600" },
            { v: "100%", l: "trazabilidad", c: "text-blue-600" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className={`text-3xl font-black ${s.c}`}>{s.v}</p>
              <p className="text-xs text-gray-500 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-gray-900 px-8 py-4 text-center w-full">
          <p className="text-sm text-gray-400">El sistema se paga solo en</p>
          <p className="text-3xl font-black text-white mt-1">menos de 2 meses</p>
        </div>
      </div>
    ),
  },

  // 10 — VISIÓN SAAS + CIERRE
  {
    bg: "bg-gray-950",
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6">Escalable</p>
        <p className="text-3xl sm:text-4xl font-black text-white mb-8">
          No es solo para una tienda. Es para todas.
        </p>
        {/* Stores → Platform */}
        <div className="flex items-end justify-center gap-5 mb-4">
          {["Murcia", "Cartagena", "Lorca"].map((city) => (
            <div key={city} className="text-center">
              <div className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-3">
                <p className="text-xl mb-1">🏪</p>
                <p className="text-xs font-bold text-white">{city}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-8 text-gray-600 text-lg mb-4">
          <span>↓</span><span>↓</span><span>↓</span>
        </div>
        <div className="rounded-2xl bg-blue-600 px-10 py-4 text-center mb-10">
          <p className="text-lg font-black text-white">MISMA PLATAFORMA · DATOS AISLADOS · CERO INSTALACIÓN</p>
          <p className="text-sm text-blue-200 mt-1">Setup + €/mes por tienda · +4.000 tiendas en España</p>
        </div>
        {/* Close */}
        <p className="text-3xl sm:text-5xl font-black text-white leading-tight">
          No vendemos automatizaciones.
        </p>
        <p className="text-3xl sm:text-5xl font-black text-blue-400 mt-2 leading-tight">
          Vendemos una forma de<br />dirigir mejor la empresa.
        </p>
        <div className="mt-8">
          <Link href="/login" className="rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
            Probar la demo →
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-600">ten21.vercel.app — Construido. Funcionando. Listo.</p>
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
            <span className={`text-xs font-mono ${slide.bg.includes("950") || slide.bg.includes("900") || slide.bg.includes("blue-600") ? "text-white/20" : "text-gray-300"}`}>
              {i + 1} / {slides.length}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
