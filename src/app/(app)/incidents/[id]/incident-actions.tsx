"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transitionIncidentAction } from "@/actions/incident.actions";
type TransitionTarget = "NOTIFIED" | "REVIEWED" | "CLOSED";

const transitionConfig: Record<
  string,
  { label: string; buttonColor: string; description: string }
> = {
  NOTIFIED: {
    label: "Marcar como notificada",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    description: "La incidencia ha sido comunicada al proveedor.",
  },
  REVIEWED: {
    label: "Marcar como revisada",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    description: "La respuesta del proveedor ha sido revisada.",
  },
  CLOSED: {
    label: "Cerrar incidencia",
    buttonColor: "bg-green-600 hover:bg-green-700",
    description: "Se requiere una resolucion para cerrar.",
  },
};

export function IncidentActions({
  incidentId,
  currentStatus,
  nextStatuses,
}: {
  incidentId: string;
  currentStatus: string;
  nextStatuses: TransitionTarget[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClose, setShowClose] = useState(false);
  const [resolution, setResolution] = useState("");

  async function handleTransition(newStatus: TransitionTarget) {
    if (newStatus === "CLOSED") {
      setShowClose(true);
      return;
    }

    setError("");
    setLoading(true);
    const result = await transitionIncidentAction({
      incidentId,
      newStatus,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error");
      return;
    }
    router.refresh();
  }

  async function handleClose() {
    if (!resolution.trim()) {
      setError("Introduce una resolucion");
      return;
    }

    setError("");
    setLoading(true);
    const result = await transitionIncidentAction({
      incidentId,
      newStatus: "CLOSED",
      resolution,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error");
      return;
    }
    setShowClose(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones</h3>

      {!showClose && (
        <div className="flex items-start gap-3">
          {nextStatuses.map((ns) => {
            const config = transitionConfig[ns];
            if (!config) return null;
            return (
              <div key={ns}>
                <button
                  onClick={() => handleTransition(ns)}
                  disabled={loading}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${config.buttonColor}`}
                >
                  {loading ? "Procesando..." : config.label}
                </button>
                <p className="mt-1 text-xs text-gray-500">{config.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {showClose && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolucion *
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              placeholder="Describe como se resolvio la incidencia..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Cerrando..." : "Confirmar cierre"}
            </button>
            <button
              onClick={() => {
                setShowClose(false);
                setResolution("");
                setError("");
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
