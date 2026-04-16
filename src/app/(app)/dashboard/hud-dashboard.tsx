"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, XAxis,
} from "recharts";
import {
  AlertTriangle, Package, Truck, ShoppingCart, Shield,
  Volume2, VolumeX, Activity, Zap, Eye,
} from "lucide-react";

// Types
type KPIs = { openIncidents: number; pendingOrders: number; todayReceptionsOk: number; vehiclesInUse: number; activeDeliveries: number };
type Alert = { id: string; type: string; label: string; sub: string; href: string; color: string };
type TodayItem = { id: string; ref: string; name: string; status: string; href: string };
type RecentItem = { id: string; label: string; sub: string; href: string; color: string };
type DayData = { day: string; value: number };

type Props = {
  kpis: KPIs;
  totalAlerts: number;
  alerts: Alert[];
  todayReceptions: TodayItem[];
  todayDeliveries: TodayItem[];
  recentIncidents: RecentItem[];
  recentOrders: RecentItem[];
  recentReceptions: RecentItem[];
  incidentsByDay: DayData[];
  deliveriesByDay: DayData[];
};

// Gauge component
function Gauge({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const data = [{ value: pct, fill: color }];
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer>
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={data} startAngle={210} endAngle={-30} barSize={8}>
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.03)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-black font-mono" style={{ color, filter: `drop-shadow(0 0 12px ${color})` }}>{value}</p>
        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// Animated scan line
function ScanLine() {
  return <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"><div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-[scan_4s_linear_infinite]" /></div>;
}

// Voice
function useSpeech() {
  const [playing, setPlaying] = useState(false);
  function speak(text: string) {
    if (playing || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES"; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
    if (v) u.voice = v;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    speechSynthesis.speak(u);
  }
  function stop() { speechSynthesis.cancel(); setPlaying(false); }
  return { playing, speak, stop };
}

// Status dot with glow
function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style={{ backgroundColor: color }} />
      <span className="relative inline-flex h-full w-full rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

export function HudDashboard(props: Props) {
  const { kpis, totalAlerts, alerts, todayReceptions, todayDeliveries, recentIncidents, recentOrders, recentReceptions, incidentsByDay, deliveriesByDay } = props;
  const { playing, speak, stop } = useSpeech();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  function briefing() {
    const parts = ["Buenos días."];
    if (totalAlerts > 0) parts.push(`Tienes ${totalAlerts} problema${totalAlerts !== 1 ? "s" : ""} que requiere${totalAlerts !== 1 ? "n" : ""} atención.`);
    else parts.push("No hay problemas activos. Todo está en orden.");
    if (kpis.openIncidents > 0) parts.push(`${kpis.openIncidents} incidencia${kpis.openIncidents !== 1 ? "s" : ""} abierta${kpis.openIncidents !== 1 ? "s" : ""}.`);
    if (kpis.pendingOrders > 0) parts.push(`${kpis.pendingOrders} pedido${kpis.pendingOrders !== 1 ? "s" : ""} pendiente${kpis.pendingOrders !== 1 ? "s" : ""}.`);
    if (kpis.activeDeliveries > 0) parts.push(`${kpis.activeDeliveries} entrega${kpis.activeDeliveries !== 1 ? "s" : ""} en curso.`);
    parts.push("Eso es todo.");
    speak(parts.join(" "));
  }

  const pieData = [
    { name: "Incidencias", value: kpis.openIncidents, color: "#ef4444" },
    { name: "Pedidos", value: kpis.pendingOrders, color: "#f59e0b" },
    { name: "Entregas", value: kpis.activeDeliveries, color: "#06b6d4" },
    { name: "Vehiculos", value: kpis.vehiclesInUse, color: "#3b82f6" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={playing ? stop : briefing}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${playing ? "bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse" : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"}`}>
            {playing ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {playing ? "Parar" : "Parte del dia"}
          </button>
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-500/40" />
            <span className="text-[10px] text-cyan-500/40 font-mono">{totalAlerts === 0 ? "NOMINAL" : "ALERTA"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black font-mono text-cyan-400/80 tracking-wider" style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.3))" }}>{time}</p>
          <p className="text-[10px] text-slate-600 font-mono">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>

      {/* STATUS + GAUGES */}
      <div className="grid grid-cols-12 gap-3">
        {/* Status banner */}
        <div className={`col-span-12 lg:col-span-4 rounded-2xl border p-6 text-center relative overflow-hidden ${totalAlerts > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
          <ScanLine />
          {totalAlerts > 0 ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400/50">Sistema</p>
              <p className="text-6xl font-black font-mono text-red-400 mt-2" style={{ filter: "drop-shadow(0 0 20px rgba(239,68,68,0.4))" }}>{totalAlerts}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-red-300/60 mt-1">Alertas activas</p>
            </>
          ) : (
            <>
              <Shield size={32} className="text-emerald-400 mx-auto mb-2" style={{ filter: "drop-shadow(0 0 15px rgba(34,197,94,0.4))" }} />
              <p className="text-xl font-black text-emerald-400">NOMINAL</p>
              <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest">Sin alertas</p>
            </>
          )}
        </div>

        {/* Gauges */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-2 h-[140px]">
          <Gauge value={kpis.openIncidents} max={10} color="#ef4444" label="Incidencias" />
        </div>
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-2 h-[140px]">
          <Gauge value={kpis.pendingOrders} max={10} color="#f59e0b" label="Pedidos" />
        </div>
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-2 h-[140px]">
          <Gauge value={kpis.activeDeliveries} max={10} color="#06b6d4" label="Entregas" />
        </div>
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-2 h-[140px]">
          <Gauge value={kpis.vehiclesInUse} max={5} color="#3b82f6" label="Vehiculos" />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-12 gap-3">
        {/* Incidents chart */}
        <div className="col-span-12 sm:col-span-4 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Incidencias 7d</p>
            <p className="text-sm font-black font-mono text-red-400">{incidentsByDay.reduce((s, d) => s + d.value, 0)}</p>
          </div>
          <div className="h-20">
            <ResponsiveContainer><AreaChart data={incidentsByDay}><defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="day" tick={{ fontSize: 9, fill: "#334155" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, color: "#e2e8f0", fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#ig)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        {/* Deliveries chart */}
        <div className="col-span-12 sm:col-span-4 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Entregas 7d</p>
            <p className="text-sm font-black font-mono text-cyan-400">{deliveriesByDay.reduce((s, d) => s + d.value, 0)}</p>
          </div>
          <div className="h-20">
            <ResponsiveContainer><BarChart data={deliveriesByDay}><XAxis dataKey="day" tick={{ fontSize: 9, fill: "#334155" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, color: "#e2e8f0", fontSize: 11 }} /><Bar dataKey="value" radius={[4,4,0,0]} fill="#06b6d4" fillOpacity={0.6} /></BarChart></ResponsiveContainer>
          </div>
        </div>

        {/* Distribution pie */}
        <div className="col-span-12 sm:col-span-4 rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Distribucion</p>
          <div className="h-20 flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <ResponsiveContainer><PieChart><Pie data={pieData.length > 0 ? pieData : [{ name: "OK", value: 1, color: "#22c55e" }]} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={35} paddingAngle={3} strokeWidth={0}>{(pieData.length > 0 ? pieData : [{ color: "#22c55e" }]).map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart></ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-slate-500">{d.name}: <span className="font-bold text-slate-300">{d.value}</span></span>
                </div>
              ))}
              {pieData.length === 0 && <p className="text-[10px] text-emerald-400">Todo OK</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="rounded-2xl bg-red-500/[0.03] border border-red-500/15 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400/60">Problemas detectados</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {alerts.map((a) => (
              <Link key={a.id} href={a.href} className="flex items-center gap-2.5 rounded-xl bg-[#0a1628] border border-[#1a2d4a] px-3 py-2.5 hover:border-red-500/30 transition-colors group">
                <StatusDot color={a.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">{a.label}</p>
                  <p className="text-[10px] text-slate-600 truncate">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* TODAY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <HudPanel title="Recepciones hoy" icon={<Package size={13} />} href="/reception" items={todayReceptions} />
        <HudPanel title="Entregas hoy" icon={<Truck size={13} />} href="/vehicles/deliveries" items={todayDeliveries} />
      </div>

      {/* RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <HudList title="Incidencias" icon={<AlertTriangle size={12} />} href="/incidents" items={recentIncidents} />
        <HudList title="Pedidos" icon={<ShoppingCart size={12} />} href="/purchases" items={recentOrders} />
        <HudList title="Recepciones" icon={<Eye size={12} />} href="/reception" items={recentReceptions} />
      </div>
    </div>
  );
}

function HudPanel({ title, icon, href, items }: { title: string; icon: React.ReactNode; href: string; items: TodayItem[] }) {
  return (
    <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-500/50">{icon}</span>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{title}</p>
        </div>
        <Link href={href} className="text-[9px] font-bold text-cyan-500/50 hover:text-cyan-400 transition-colors uppercase tracking-wider">Ver →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-slate-700 text-center py-3 font-mono">— sin datos —</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="flex items-center justify-between rounded-lg bg-[#050a14] border border-[#1a2d4a]/40 px-3 py-2 hover:border-cyan-500/20 transition-colors">
              <div className="flex items-center gap-2">
                <Zap size={10} className="text-cyan-500/30" />
                <span className="text-[11px] font-mono font-bold text-cyan-400/80">{item.ref}</span>
                <span className="text-[11px] text-slate-500">{item.name}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-600">{item.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function HudList({ title, icon, href, items }: { title: string; icon: React.ReactNode; href: string; items: RecentItem[] }) {
  return (
    <div className="rounded-2xl bg-[#0a1628] border border-[#1a2d4a] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="text-cyan-500/50">{icon}</span><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{title}</p></div>
        <Link href={href} className="text-[9px] font-bold text-cyan-500/50 hover:text-cyan-400 transition-colors uppercase tracking-wider">Ver →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-slate-700 text-center py-3 font-mono">— sin datos —</p>
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-cyan-500/[0.03] transition-colors">
              <div className="h-1 w-1 rounded-full" style={{ backgroundColor: item.color }} />
              <p className="text-[11px] text-slate-400 truncate flex-1">{item.label}</p>
              <p className="text-[9px] text-slate-600">{item.sub}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
