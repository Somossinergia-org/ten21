"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { startDeliveryAction, completeDeliveryAction } from "@/actions/delivery.actions";

export function DeliveryActions({
  deliveryId,
  currentStatus,
}: {
  deliveryId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");

  async function handleStart() {
    if (loading) return;
    setError("");
    setLoading(true);

    const result = await startDeliveryAction({
      deliveryId,
      startKm: startKm ? parseInt(startKm) : undefined,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Error");
      return;
    }
    toast("Ruta iniciada");
    router.refresh();
  }

  async function handleComplete(failed: boolean) {
    if (loading) return;
    setError("");
    setLoading(true);

    const result = await completeDeliveryAction({
      deliveryId,
      endKm: endKm ? parseInt(endKm) : undefined,
      failed,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Error");
      return;
    }
    toast(failed ? "Entrega marcada como fallida" : "Entrega completada", failed ? "error" : "success");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones</h3>

      {currentStatus === "ASSIGNED" && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Km salida (opcional)</label>
            <input
              type="number"
              min="0"
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              placeholder="0"
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando..." : "Iniciar ruta"}
          </button>
        </div>
      )}

      {currentStatus === "IN_TRANSIT" && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Km llegada (opcional)</label>
            <input
              type="number"
              min="0"
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              placeholder="0"
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => handleComplete(false)}
            disabled={loading}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Marcar entregada"}
          </button>
          <button
            onClick={() => handleComplete(true)}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Marcar fallida"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
