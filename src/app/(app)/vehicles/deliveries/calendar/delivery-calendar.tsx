"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  color: string;
  url: string;
};

export function DeliveryCalendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      locale="es"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek",
      }}
      buttonText={{
        today: "Hoy",
        month: "Mes",
        week: "Semana",
      }}
      height="auto"
      eventClick={(info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          router.push(info.event.url);
        }
      }}
      eventDisplay="block"
      dayMaxEventRows={3}
    />
  );
}
