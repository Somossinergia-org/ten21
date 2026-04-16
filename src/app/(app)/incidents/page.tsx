import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as incidentService from "@/services/incident.service";
import type { IncidentStatus } from "@prisma/client";

const typeLabels: Record<string, string> = {
  QUANTITY_MISMATCH: "Diferencia cantidad",
  DAMAGED: "Dañado",
  WRONG_PRODUCT: "Producto equivocado",
  OTHER: "Otro",
};

const statusConfig: { key: IncidentStatus | "ALL"; label: string; color: string }[] = [
  { key: "ALL", label: "Todas", color: "bg-gray-100 text-gray-700" },
  { key: "REGISTERED", label: "Registradas", color: "bg-yellow-100 text-yellow-700" },
  { key: "NOTIFIED", label: "Notificadas", color: "bg-blue-100 text-blue-700" },
  { key: "REVIEWED", label: "Revisadas", color: "bg-purple-100 text-purple-700" },
  { key: "CLOSED", label: "Cerradas", color: "bg-green-100 text-green-700" },
];

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const { status: statusParam } = await searchParams;

  const validStatuses: IncidentStatus[] = ["REGISTERED", "NOTIFIED", "REVIEWED", "CLOSED"];
  const statusFilter = validStatuses.includes(statusParam as IncidentStatus)
    ? (statusParam as IncidentStatus)
    : undefined;

  const incidents = await incidentService.listIncidents(tenantId, statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Incidencias detectadas en recepciones de mercancia
          </p>
        </div>
        <a
          href="/api/export/incidents"
          className="rounded-lg border border-[#1a2d4a] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
        >
          Exportar Excel
        </a>
      </div>

      {/* Status filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusConfig.map((tab) => {
          const isActive =
            (tab.key === "ALL" && !statusFilter) ||
            tab.key === statusFilter;
          const href =
            tab.key === "ALL" ? "/incidents" : `/incidents?status=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? tab.color + " ring-2 ring-offset-1 ring-gray-300"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Recepcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pedido</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  {statusFilter
                    ? `No hay incidencias con estado "${statusConfig.find((s) => s.key === statusFilter)?.label}".`
                    : "No hay incidencias registradas."}
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const cfg = statusConfig.find((s) => s.key === inc.status);
                return (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {typeLabels[inc.type] || inc.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {inc.description}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">
                      {inc.reception.receptionNumber}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">
                      {inc.reception.purchaseOrder.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cfg?.color || "bg-gray-100"}`}>
                        {cfg?.label || inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(inc.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/incidents/${inc.id}`}
                        className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                      >
                        Ver
                      </Link>
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
