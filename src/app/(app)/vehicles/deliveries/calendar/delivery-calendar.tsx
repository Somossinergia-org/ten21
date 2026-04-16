"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  color: string;
  url: string;
  extendedProps: {
    deliveryNumber: string;
    customerName: string;
    customerPhone: string | null;
    customerAddress: string;
    description: string;
    status: string;
    statusLabel: string;
    vehicleName: string;
    vehiclePlate: string;
    assignedTo: string;
    startKm: number | null;
    endKm: number | null;
  };
};

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  IN_TRANSIT: "bg-yellow-100 text-yellow-800 border-yellow-300",
  FAILED: "bg-red-100 text-red-800 border-red-300",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
  PENDING: "bg-gray-100 text-gray-700 border-gray-300",
};

export function DeliveryCalendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<CalendarEvent["extendedProps"] & { id: string; url: string } | null>(null);

  function handleClick(info: EventClickArg) {
    info.jsEvent.preventDefault();
    const ev = info.event;
    setSelected({
      id: ev.id,
      url: ev.url,
      ...ev.extendedProps as CalendarEvent["extendedProps"],
    });
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="es"
        firstDay={1}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,listWeek",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          list: "Lista",
        }}
        height="auto"
        eventClick={handleClick}
        eventDisplay="block"
        dayMaxEventRows={4}
        navLinks
        nowIndicator
        eventClassNames="cursor-pointer rounded-md text-xs font-semibold px-1 py-0.5"
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header with status */}
            <div className={`px-5 py-4 border-b-2 ${statusColors[selected.status] || "bg-gray-100 border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black">{selected.deliveryNumber}</p>
                  <p className="text-sm font-medium">{selected.statusLabel}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-2xl opacity-50 hover:opacity-100">×</button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              {/* Customer */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{selected.customerName}</p>
                {selected.customerPhone && (
                  <a href={`tel:${selected.customerPhone}`} className="text-sm text-blue-600 hover:underline">{selected.customerPhone}</a>
                )}
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Direccion</p>
                <p className="text-sm text-gray-700">{selected.customerAddress}</p>
              </div>

              {/* What's delivered */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Mercancia</p>
                <p className="text-sm text-gray-700">{selected.description}</p>
              </div>

              {/* Vehicle + Driver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Vehiculo</p>
                  <p className="text-sm text-gray-700">{selected.vehicleName}</p>
                  <p className="text-xs text-gray-400 font-mono">{selected.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Repartidor</p>
                  <p className="text-sm text-gray-700">{selected.assignedTo}</p>
                </div>
              </div>

              {/* Km if available */}
              {(selected.startKm !== null || selected.endKm !== null) && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Kilometraje</p>
                  <p className="text-sm text-gray-700">
                    {selected.startKm !== null && `Salida: ${selected.startKm} km`}
                    {selected.startKm !== null && selected.endKm !== null && " → "}
                    {selected.endKm !== null && `Llegada: ${selected.endKm} km`}
                    {selected.startKm !== null && selected.endKm !== null && (
                      <span className="ml-2 text-blue-600 font-semibold">({selected.endKm - selected.startKm} km)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t flex gap-2">
              <button
                onClick={() => { router.push(selected.url); setSelected(null); }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Ver detalle completo
              </button>
              {selected.customerPhone && (
                <a
                  href={`tel:${selected.customerPhone}`}
                  className="rounded-lg border-2 border-green-500 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition-colors"
                >
                  Llamar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
