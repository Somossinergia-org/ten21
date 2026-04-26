"use client";

import Link from "next/link";
import { MapPin, Phone, Truck, Clock } from "lucide-react";

type Delivery = {
  id: string;
  deliveryNumber: string;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string;
  description: string;
  status: string;
  scheduledDate: Date | null;
  vehicle: { name: string; plate: string } | null;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  ASSIGNED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_TRANSIT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", ASSIGNED: "Asignada", IN_TRANSIT: "En ruta",
};

export function MobileRepartoClient({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <div className="mt-4 space-y-3">
      {deliveries.length === 0 ? (
        <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-8 text-center">
          <Truck size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">Sin entregas pendientes</p>
        </div>
      ) : (
        deliveries.map((d) => (
          <Link key={d.id} href={`/vehicles/deliveries/${d.id}`}
            className="block rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 hover:bg-white/[0.02] active:scale-[0.99] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-cyan-400">{d.deliveryNumber}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusColors[d.status] || "text-slate-400"}`}>
                {statusLabels[d.status] || d.status}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">{d.customerName}</p>
            <p className="text-xs text-slate-400 mb-2">{d.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={11} /> {d.customerAddress}</span>
              {d.customerPhone && <span className="flex items-center gap-1"><Phone size={11} /> {d.customerPhone}</span>}
              {d.vehicle && <span className="flex items-center gap-1"><Truck size={11} /> {d.vehicle.name}</span>}
              {d.scheduledDate && <span className="flex items-center gap-1"><Clock size={11} /> {new Date(d.scheduledDate).toLocaleDateString("es-ES")}</span>}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
