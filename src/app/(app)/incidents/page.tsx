import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as incidentService from "@/services/incident.service";

const typeLabels: Record<string, string> = {
  QUANTITY_MISMATCH: "Diferencia cantidad",
  DAMAGED: "Dañado",
  WRONG_PRODUCT: "Producto equivocado",
  OTHER: "Otro",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "Registrada", color: "bg-yellow-100 text-yellow-700" },
  NOTIFIED: { label: "Notificada", color: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "Revisada", color: "bg-purple-100 text-purple-700" },
  CLOSED: { label: "Cerrada", color: "bg-green-100 text-green-700" },
};

export default async function IncidentsPage() {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const incidents = await incidentService.listIncidents(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
      <p className="mt-1 text-sm text-gray-500">
        Incidencias detectadas en recepciones de mercancia
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Recepcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pedido</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reportado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay incidencias registradas.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const status = statusLabels[inc.status] || { label: inc.status, color: "bg-gray-100" };
                return (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {typeLabels[inc.type] || inc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {inc.description}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/reception/${inc.receptionId}`}
                        className="text-sm font-mono text-blue-600 hover:text-blue-800"
                      >
                        {inc.reception.receptionNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">
                      {inc.reception.purchaseOrder.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{inc.reportedBy.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(inc.createdAt).toLocaleDateString("es-ES")}
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
