"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { transitionIncidentAction } from "@/actions/incident.actions";

type TransitionTarget = "NOTIFIED" | "REVIEWED" | "CLOSED";

const transitionConfig: Record<
  TransitionTarget,
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
  const [success, setSuccess] = useState("");
  const [showClose, setShowClose] = useState(false);
  const [resolution, setResolution] = useState("");

  const handleTransition = useCallback(
    async (newStatus: TransitionTarget) => {
      if (newStatus === "CLOSED") {
        setShowClose(true);
        return;
      }

      if (loading) return; // Prevent double submit

      setError("");
      setSuccess("");
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

      const config = transitionConfig[newStatus];
      setSuccess(`Estado cambiado: ${config.label.replace("Marcar como ", "")}`);
      router.refresh();
    },
    [incidentId, loading, router],
  );

  async function handleClose() {
    if (!resolution.trim()) {
      setError("Introduce una resolucion");
      return;
    }

    if (loading) return; // Prevent double submit

    setError("");
    setSuccess("");
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
    setSuccess("Incidencia cerrada correctamente");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones</h3>

      {/* Success feedback */}
      {success && (
        <div className="mb-3 rounded-md bg-green-50 border border-green-200 px-3 py-2">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

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
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
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
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cerrando..." : "Confirmar cierre"}
            </button>
            <button
              onClick={() => {
                setShowClose(false);
                setResolution("");
                setError("");
              }}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error feedback */}
      {error && (
        <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
