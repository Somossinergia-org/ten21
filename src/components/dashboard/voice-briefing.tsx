"use client";

import { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

type BriefingData = {
  openIncidents: number;
  pendingOrders: number;
  todayReceptionsOk: number;
  vehiclesInUse: number;
  activeDeliveries: number;
  alertCount: number;
};

function generateBriefingText(data: BriefingData): string {
  const parts: string[] = [];
  parts.push("Buenos días.");

  if (data.alertCount > 0) {
    parts.push(`Tienes ${data.alertCount} problema${data.alertCount !== 1 ? "s" : ""} que requiere${data.alertCount !== 1 ? "n" : ""} atención.`);
  } else {
    parts.push("No hay problemas activos. Todo está en orden.");
  }

  if (data.openIncidents > 0) {
    parts.push(`Hay ${data.openIncidents} incidencia${data.openIncidents !== 1 ? "s" : ""} abierta${data.openIncidents !== 1 ? "s" : ""}.`);
  }

  if (data.pendingOrders > 0) {
    parts.push(`${data.pendingOrders} pedido${data.pendingOrders !== 1 ? "s" : ""} pendiente${data.pendingOrders !== 1 ? "s" : ""} de recibir.`);
  }

  if (data.todayReceptionsOk > 0) {
    parts.push(`${data.todayReceptionsOk} recepción completada hoy sin problemas.`);
  }

  if (data.activeDeliveries > 0) {
    parts.push(`${data.activeDeliveries} entrega${data.activeDeliveries !== 1 ? "s" : ""} en curso.`);
  }

  if (data.vehiclesInUse > 0) {
    parts.push(`${data.vehiclesInUse} vehículo${data.vehiclesInUse !== 1 ? "s" : ""} en uso.`);
  }

  parts.push("Eso es todo por ahora.");
  return parts.join(" ");
}

export function VoiceBriefing({ data }: { data: BriefingData }) {
  const [playing, setPlaying] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  function play() {
    if (!supported || playing) return;

    const text = generateBriefingText(data);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to find a Spanish voice
    const voices = speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.startsWith("es"));
    if (esVoice) utterance.voice = esVoice;

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    speechSynthesis.speak(utterance);
  }

  function stop() {
    speechSynthesis.cancel();
    setPlaying(false);
  }

  if (!supported) return null;

  return (
    <button
      onClick={playing ? stop : play}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
        playing
          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
          : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 glow-cyan"
      }`}
    >
      {playing ? (
        <>
          <VolumeX size={18} />
          <span>Parar</span>
        </>
      ) : (
        <>
          <Volume2 size={18} />
          <span>Parte del dia</span>
        </>
      )}
    </button>
  );
}
