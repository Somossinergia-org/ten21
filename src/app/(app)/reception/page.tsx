import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as receptionService from "@/services/reception.service";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  CHECKING: { label: "En chequeo", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completada", color: "bg-green-100 text-green-700" },
  WITH_INCIDENTS: { label: "Con incidencias", color: "bg-red-100 text-red-700" },
};

export default async function ReceptionPage() {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const receptions = await receptionService.listReceptions(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepciones</h1>
          <p className="mt-1 text-sm text-gray-500">Albaranes recibidos y su estado</p>
        </div>
        <Link
          href="/reception/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva recepcion
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Recepcion</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pedido</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Recibido por</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Incidencias</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {receptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay recepciones. Registra la primera.
                </td>
              </tr>
            ) : (
              receptions.map((rec) => {
                const status = statusLabels[rec.status] || { label: rec.status, color: "bg-gray-100" };
                return (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                      {rec.receptionNumber}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {rec.purchaseOrder.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.purchaseOrder.supplier.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{rec.receivedBy.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {rec._count.incidents > 0 ? (
                        <span className="font-medium text-red-600">{rec._count.incidents}</span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(rec.receivedAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/reception/${rec.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
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
