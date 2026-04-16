"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type DayData = { day: string; value: number };

export function DashboardSparklines({ incidentsByDay, deliveriesByDay }: { incidentsByDay: DayData[]; deliveriesByDay: DayData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SparkCard title="Incidencias (7 dias)" data={incidentsByDay} color="#ef4444" gradientId="incGrad" />
      <SparkCard title="Entregas (7 dias)" data={deliveriesByDay} color="#06b6d4" gradientId="delGrad" />
    </div>
  );
}

function SparkCard({ title, data, color, gradientId }: { title: string; data: DayData[]; color: string; gradientId: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-xl bg-[#0a1628] border border-[#1a2d4a] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
        <p className="text-lg font-black" style={{ color, filter: `drop-shadow(0 0 8px ${color}40)` }}>{total}</p>
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2d4a", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} name="Cantidad" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
