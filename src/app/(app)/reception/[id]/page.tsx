import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as receptionService from "@/services/reception.service";
import * as activityService from "@/services/activity.service";
import * as attachmentService from "@/services/attachment.service";
import { AttachmentsSection } from "@/components/attachments/attachments-section";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";

const receptionStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  CHECKING: { label: "En chequeo", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completada", color: "bg-green-100 text-green-700" },
  WITH_INCIDENTS: { label: "Con incidencias", color: "bg-red-100 text-red-700" },
};

const incidentTypeLabels: Record<string, string> = {
  QUANTITY_MISMATCH: "Diferencia cantidad",
  DAMAGED: "Dañado",
  WRONG_PRODUCT: "Producto equivocado",
  OTHER: "Otro",
};

const incidentStatusLabels: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "Registrada", color: "bg-yellow-100 text-yellow-700" },
  NOTIFIED: { label: "Notificada", color: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "Revisada", color: "bg-purple-100 text-purple-700" },
  CLOSED: { label: "Cerrada", color: "bg-green-100 text-green-700" },
};

export default async function ReceptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const { id } = await params;

  const reception = await receptionService.getReception(id, tenantId);
  if (!reception) notFound();

  const [attachments, activityLogs] = await Promise.all([
    attachmentService.listForEntity(tenantId, "RECEPTION", id),
    activityService.listForEntity(tenantId, "Reception", id),
  ]);

  const status = receptionStatusLabels[reception.status] || {
    label: reception.status,
    color: "bg-gray-100",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{reception.receptionNumber}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Pedido {reception.purchaseOrder.orderNumber} — {reception.purchaseOrder.supplier.name}
          </p>
          <p className="text-sm text-gray-500">
            Recibido por {reception.receivedBy.name} el{" "}
            {new Date(reception.receivedAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/reception"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
      </div>

      {/* Info cards */}
      {(reception.deliveryNoteRef || reception.notes) && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reception.deliveryNoteRef && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Albaran proveedor</p>
              <p className="mt-1 text-sm text-gray-900">{reception.deliveryNoteRef}</p>
            </div>
          )}
          {reception.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Notas</p>
              <p className="mt-1 text-sm text-gray-900">{reception.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Lines table */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Lineas recibidas</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Esperado</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Recibido</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Dañado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reception.lines.map((line) => {
                const mismatch = line.quantityReceived !== line.quantityExpected;
                const damaged = line.quantityDamaged > 0;
                const hasIssue = mismatch || damaged;

                return (
                  <tr key={line.id} className={hasIssue ? "bg-red-50" : ""}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-900">
                        {line.purchaseOrderLine.product.ref}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {line.purchaseOrderLine.product.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {line.quantityExpected}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${mismatch ? "text-red-700" : "text-green-700"}`}>
                      {line.quantityReceived}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${damaged ? "font-medium text-orange-700" : "text-gray-400"}`}>
                      {line.quantityDamaged}
                    </td>
                    <td className="px-4 py-3">
                      {hasIssue ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Incidencia
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{line.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incidents */}
      {reception.incidents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Incidencias detectadas ({reception.incidents.length})
          </h2>
          <div className="space-y-2">
            {reception.incidents.map((inc) => {
              const incStatus = incidentStatusLabels[inc.status] || {
                label: inc.status,
                color: "bg-gray-100",
              };
              return (
                <div
                  key={inc.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {incidentTypeLabels[inc.type] || inc.type}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${incStatus.color}`}>
                        {incStatus.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{inc.description}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(inc.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attachments */}
      <AttachmentsSection entity="RECEPTION" entityId={reception.id} attachments={attachments} />

      {/* Activity Timeline */}
      <ActivityTimeline logs={activityLogs} />
    </div>
  );
}
