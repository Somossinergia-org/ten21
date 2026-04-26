"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncVehiclesAction } from "@/actions/vehicle.actions";

type Vehicle = {
  id: string;
  plate: string;
  name: string;
  status: string;
  active: boolean;
  externalId: string | null;
  lastSyncedAt: Date | null;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponible", color: "bg-green-100 text-green-700" },
  IN_USE: { label: "En uso", color: "bg-blue-100 text-blue-700" },
  INCIDENT: { label: "Averiado", color: "bg-red-100 text-red-700" },
  WORKSHOP: { label: "En taller", color: "bg-yellow-100 text-yellow-700" },
};

export function VehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);

    const result = await syncVehiclesAction();
    setSyncing(false);

    if (result.success) {
      const parts = [`${result.total} vehiculo(s): ${result.created} nuevos, ${result.updated} actualizados`];
      if (result.skippedStatus) parts.push(`${result.skippedStatus} con estado protegido (entrega activa)`);
      if (result.errors?.length) parts.push(`${result.errors.length} error(es)`);
      setSyncResult({
        success: true,
        message: `Sincronizados ${parts.join(". ")}.`,
      });
      router.refresh();
    } else {
      setSyncResult({
        success: false,
        message: result.error || "Error al sincronizar",
      });
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Sync button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? "Sincronizando..." : "Sincronizar con GPS"}
        </button>
        {syncResult && (
          <p
            className={`text-sm ${
              syncResult.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {syncResult.message}
          </p>
        )}
      </div>

      {/* Vehicles table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Matricula
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                GPS
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Ultima sync
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No hay vehiculos. Usa &quot;Sincronizar con GPS&quot; para importar.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => {
                const status = statusLabels[v.status] || {
                  label: v.status,
                  color: "bg-gray-100",
                };
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {v.plate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {v.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {v.externalId ? (
                        <span className="font-mono text-xs text-green-600">
                          ID: {v.externalId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {v.lastSyncedAt
                        ? new Date(v.lastSyncedAt).toLocaleString("es-ES")
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
