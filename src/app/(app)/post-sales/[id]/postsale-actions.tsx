"use client";

import { useState } from "react";
import { transitionPostSaleTicketAction } from "@/actions/post-sale-ticket.actions";

const validNext: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "WAITING_SUPPLIER", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["WAITING_SUPPLIER", "RESOLVED", "CLOSED"],
  WAITING_SUPPLIER: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

const labels: Record<string, string> = {
  IN_PROGRESS: "En progreso", WAITING_SUPPLIER: "Esperando proveedor",
  RESOLVED: "Resuelto", CLOSED: "Cerrar",
};

export function PostSaleActions({ ticketId, status }: { ticketId: string; status: string }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [resolution, setResolution] = useState("");
  const [showResolution, setShowResolution] = useState(false);

  const nextStatuses = validNext[status] || [];
  if (nextStatuses.length === 0) return null;

  async function handleTransition(newStatus: string) {
    if (newStatus === "CLOSED" && !showResolution) {
      setShowResolution(true);
      return;
    }
    if (newStatus === "CLOSED" && !resolution.trim()) {
      setError("La resolucion es obligatoria para cerrar");
      return;
    }

    setLoading(newStatus);
    setError("");
    const result = await transitionPostSaleTicketAction({
      ticketId, newStatus,
      resolution: newStatus === "CLOSED" ? resolution : undefined,
    });
    setLoading("");
    if (!result.success) setError(result.error || "Error");
  }

  return (
    <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Cambiar estado</h3>

      {showResolution && (
        <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
          placeholder="Resolucion del ticket (obligatorio)..." rows={3}
          className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none mb-2" />
      )}

      <div className="space-y-1.5">
        {nextStatuses.map((s) => (
          <button key={s} onClick={() => handleTransition(s)} disabled={!!loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              s === "CLOSED" ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-[#1a2d4a] text-slate-300 hover:bg-white/[0.03]"
            }`}>
            {loading === s ? "Procesando..." : labels[s] || s}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
