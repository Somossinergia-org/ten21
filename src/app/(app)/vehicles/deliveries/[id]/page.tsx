import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as deliveryService from "@/services/delivery.service";
import * as activityService from "@/services/activity.service";
import * as attachmentService from "@/services/attachment.service";
import { DeliveryActions } from "./delivery-actions";
import { AttachmentsSection } from "@/components/attachments/attachments-section";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  ASSIGNED: { label: "Asignada", color: "bg-blue-100 text-blue-700" },
  IN_TRANSIT: { label: "En ruta", color: "bg-yellow-100 text-yellow-700" },
  DELIVERED: { label: "Entregada", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Fallida", color: "bg-red-100 text-red-700" },
};

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["JEFE", "REPARTO"]);
  const tenantId = await getTenantId();
  const user = await getCurrentUser();
  const { id } = await params;

  const delivery = await deliveryService.getDelivery(id, tenantId);
  if (!delivery) notFound();

  // REPARTO can only see their own deliveries
  if (user.role === "REPARTO" && delivery.assignedToId !== user.id) notFound();

  const [attachments, activityLogs] = await Promise.all([
    attachmentService.listForEntity(tenantId, "DELIVERY", id),
    activityService.listForEntity(tenantId, "Delivery", id),
  ]);

  const status = statusLabels[delivery.status] || { label: delivery.status, color: "bg-gray-100" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{delivery.deliveryNumber}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {delivery.description}
          </p>
        </div>
        <Link href="/vehicles/deliveries" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Cliente</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{delivery.customerName}</p>
          {delivery.customerPhone && <p className="text-xs text-gray-500">{delivery.customerPhone}</p>}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:col-span-2">
          <p className="text-xs font-medium uppercase text-gray-500">Direccion</p>
          <p className="mt-1 text-sm text-gray-900">{delivery.customerAddress}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Vehiculo</p>
          <p className="mt-1 text-sm text-gray-900">{delivery.vehicle?.name || "—"}</p>
          <p className="text-xs text-gray-500">{delivery.vehicle?.plate}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Repartidor</p>
          <p className="mt-1 text-sm text-gray-900">{delivery.assignedTo?.name || "—"}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Fecha programada</p>
          <p className="mt-1 text-sm text-gray-900">
            {delivery.scheduledDate
              ? new Date(delivery.scheduledDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "Sin programar"}
          </p>
        </div>
        {(delivery.startKm !== null || delivery.endKm !== null) && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-gray-500">Kilometraje</p>
            <p className="mt-1 text-sm text-gray-900">
              {delivery.startKm !== null ? `Salida: ${delivery.startKm} km` : ""}
              {delivery.startKm !== null && delivery.endKm !== null ? " — " : ""}
              {delivery.endKm !== null ? `Llegada: ${delivery.endKm} km` : ""}
            </p>
            {delivery.startKm !== null && delivery.endKm !== null && (
              <p className="text-xs text-gray-500">
                Recorrido: {delivery.endKm - delivery.startKm} km
              </p>
            )}
          </div>
        )}
        {delivery.deliveredAt && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium uppercase text-green-700">
              {delivery.status === "FAILED" ? "Fecha intento" : "Entregada"}
            </p>
            <p className="mt-1 text-sm text-green-900">
              {new Date(delivery.deliveredAt).toLocaleString("es-ES")}
            </p>
          </div>
        )}
        {delivery.notes && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-gray-500">Notas</p>
            <p className="mt-1 text-sm text-gray-900">{delivery.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(delivery.status === "ASSIGNED" || delivery.status === "IN_TRANSIT") && (
        <div className="mt-6">
          <DeliveryActions
            deliveryId={delivery.id}
            currentStatus={delivery.status}
          />
        </div>
      )}

      {/* Attachments */}
      <AttachmentsSection entity="DELIVERY" entityId={delivery.id} attachments={attachments} />

      {/* Activity Timeline */}
      <ActivityTimeline logs={activityLogs} />
    </div>
  );
}
