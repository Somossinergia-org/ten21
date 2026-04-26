import { db } from "@/lib/db";
import type { NotificationType, NotificationSeverity } from "@prisma/client";

type CreateNotifInput = {
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  entityType?: string;
  entityId?: string;
  userId?: string | null; // null = para todos los del tenant
};

export async function createNotification(data: CreateNotifInput) {
  try {
    return await db.notification.create({
      data: {
        tenantId: data.tenantId,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity || "MEDIUM",
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        userId: data.userId || null,
      },
    });
  } catch (e) {
    console.error("[notification] create failed:", e);
    return null;
  }
}

export async function listForUser(tenantId: string, userId: string, limit = 30) {
  return db.notification.findMany({
    where: {
      tenantId,
      OR: [
        { userId },     // Para este usuario
        { userId: null }, // Para todos
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnread(tenantId: string, userId: string) {
  return db.notification.count({
    where: {
      tenantId,
      readAt: null,
      OR: [{ userId }, { userId: null }],
    },
  });
}

export async function markAsRead(id: string, tenantId: string) {
  return db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(tenantId: string, userId: string) {
  return db.notification.updateMany({
    where: {
      tenantId,
      readAt: null,
      OR: [{ userId }, { userId: null }],
    },
    data: { readAt: new Date() },
  });
}

// Helpers to create typed notifications from business events
export async function notifyIncidentCreated(tenantId: string, description: string, receptionNumber: string, incidentId: string) {
  return createNotification({
    tenantId,
    type: "INCIDENT_CREATED",
    title: "Nueva incidencia detectada",
    message: `${description} (Recepción ${receptionNumber})`,
    severity: "HIGH",
    entityType: "Incident",
    entityId: incidentId,
    userId: null, // Para el jefe (todos)
  });
}

export async function notifyDeliveryFailed(tenantId: string, deliveryNumber: string, customerName: string, notes: string | null, deliveryId: string) {
  return createNotification({
    tenantId,
    type: "DELIVERY_FAILED",
    title: "Entrega fallida",
    message: `${deliveryNumber} — ${customerName}${notes ? `: ${notes}` : ""}`,
    severity: "HIGH",
    entityType: "Delivery",
    entityId: deliveryId,
    userId: null,
  });
}

export async function notifyOrderPartial(tenantId: string, orderNumber: string, orderId: string) {
  return createNotification({
    tenantId,
    type: "ORDER_PARTIAL",
    title: "Pedido recibido parcialmente",
    message: `${orderNumber} tiene líneas pendientes de recibir`,
    severity: "MEDIUM",
    entityType: "PurchaseOrder",
    entityId: orderId,
    userId: null,
  });
}

export async function notifyInvoiceMismatch(tenantId: string, invoiceNumber: string, reason: string, invoiceId: string) {
  return createNotification({
    tenantId,
    type: "INVOICE_MISMATCH",
    title: "Discrepancia en factura",
    message: `Factura ${invoiceNumber}: ${reason}`,
    severity: "HIGH",
    entityType: "SupplierInvoice",
    entityId: invoiceId,
    userId: null,
  });
}
