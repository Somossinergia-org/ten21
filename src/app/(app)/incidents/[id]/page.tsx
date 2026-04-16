import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getCurrentUser } from "@/lib/tenant";
import * as incidentService from "@/services/incident.service";
import * as activityService from "@/services/activity.service";
import * as attachmentService from "@/services/attachment.service";
import { IncidentActions } from "./incident-actions";
import { AttachmentsSection } from "@/components/attachments/attachments-section";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";

const typeLabels: Record<string, string> = {
  QUANTITY_MISMATCH: "Diferencia de cantidad",
  DAMAGED: "Mercancia dañada",
  WRONG_PRODUCT: "Producto equivocado",
  OTHER: "Otro",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "Registrada", color: "bg-yellow-100 text-yellow-700" },
  NOTIFIED: { label: "Notificada", color: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "Revisada", color: "bg-purple-100 text-purple-700" },
  CLOSED: { label: "Cerrada", color: "bg-green-100 text-green-700" },
};

const statusFlow = [
  { key: "REGISTERED", label: "Registrada" },
  { key: "NOTIFIED", label: "Notificada" },
  { key: "REVIEWED", label: "Revisada" },
  { key: "CLOSED", label: "Cerrada" },
];

function formatDate(date: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["JEFE", "ALMACEN"]);
  const user = await getCurrentUser();
  const { id } = await params;

  const incident = await incidentService.getIncident(id, user.tenantId);
  if (!incident) notFound();

  const [attachments, activityLogs] = await Promise.all([
    attachmentService.listForEntity(user.tenantId, "INCIDENT", id),
    activityService.listForEntity(user.tenantId, "Incident", id),
  ]);

  const status = statusLabels[incident.status] || { label: incident.status, color: "bg-gray-100" };
  const nextStatuses = incidentService.getNextStatuses(incident.status) as
    ("NOTIFIED" | "REVIEWED" | "CLOSED")[];
  const isJefe = user.role === "JEFE";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {typeLabels[incident.type] || incident.type}
            </h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Registrada el {formatDate(incident.createdAt)}
          </p>
        </div>
        <Link
          href="/incidents"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
      </div>

      {/* Status flow indicator */}
      <div className="mt-6 flex items-center gap-1">
        {statusFlow.map((step, i) => {
          const stepIdx = statusFlow.findIndex((s) => s.key === step.key);
          const currentIdx = statusFlow.findIndex((s) => s.key === incident.status);
          const isDone = stepIdx <= currentIdx;
          const isCurrent = stepIdx === currentIdx;

          return (
            <div key={step.key} className="flex items-center">
              {i > 0 && (
                <div className={`h-0.5 w-8 ${isDone ? "bg-blue-500" : "bg-gray-200"}`} />
              )}
              <div
                className={`flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isDone
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Descripcion</p>
          <p className="mt-1 text-sm text-gray-900">{incident.description}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Recepcion</p>
          <Link
            href={`/reception/${incident.reception.id}`}
            className="mt-1 block text-sm font-mono text-cyan-400 hover:text-cyan-300"
          >
            {incident.reception.receptionNumber}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            Pedido {incident.reception.purchaseOrder.orderNumber}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Proveedor</p>
          <p className="mt-1 text-sm text-gray-900">
            {incident.reception.purchaseOrder.supplier.name}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Reportada por</p>
          <p className="mt-1 text-sm text-gray-900">{incident.reportedBy.name}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Tipo</p>
          <p className="mt-1 text-sm text-gray-900">{typeLabels[incident.type]}</p>
        </div>

        {/* Traceability: reviewedAt */}
        {incident.reviewedAt && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-medium uppercase text-purple-700">Revisada</p>
            <p className="mt-1 text-sm text-purple-900">{formatDate(incident.reviewedAt)}</p>
          </div>
        )}

        {/* Traceability: closedAt + closedBy */}
        {incident.closedAt && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium uppercase text-green-700">Cerrada</p>
            <p className="mt-1 text-sm text-green-900">{formatDate(incident.closedAt)}</p>
            {incident.closedBy && (
              <p className="text-xs text-green-700 mt-0.5">por {incident.closedBy.name}</p>
            )}
          </div>
        )}

        {/* Resolution */}
        {incident.resolution && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase text-green-700">Resolucion</p>
            <p className="mt-1 text-sm text-green-900">{incident.resolution}</p>
          </div>
        )}
      </div>

      {/* Actions for JEFE */}
      {isJefe && nextStatuses.length > 0 && (
        <div className="mt-6">
          <IncidentActions
            incidentId={incident.id}
            currentStatus={incident.status}
            nextStatuses={nextStatuses}
          />
        </div>
      )}

      {/* ALMACEN sees a note */}
      {!isJefe && nextStatuses.length > 0 && (
        <div className="mt-6 rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Solo el jefe puede cambiar el estado de las incidencias.
          </p>
        </div>
      )}

      {/* Attachments */}
      <AttachmentsSection entity="INCIDENT" entityId={incident.id} attachments={attachments} />

      {/* Activity Timeline */}
      <ActivityTimeline logs={activityLogs} />
    </div>
  );
}
