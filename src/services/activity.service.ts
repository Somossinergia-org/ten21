import { db } from "@/lib/db";

export type ActivityAction =
  | "purchase.created"
  | "purchase.sent"
  | "reception.created"
  | "reception.completed"
  | "incident.created"
  | "incident.notified"
  | "incident.reviewed"
  | "incident.closed"
  | "delivery.created"
  | "delivery.started"
  | "delivery.completed"
  | "delivery.failed"
  | "product.created"
  | "product.updated"
  | "supplier.created"
  | "supplier.updated"
  | "vehicle.created"
  | "vehicle.updated"
  | "vehicle.synced"
  | "user.created"
  | "user.updated"
  | "customer.created"
  | "customer.updated"
  | "invoice.created"
  | "invoice.reconciled"
  | "notification.created"
  | "sale.created"
  | "sale.confirmed"
  | "sale.cancelled"
  | "sale.delivered"
  | "stock.reception_in"
  | "stock.sale_reserve"
  | "stock.sale_release"
  | "stock.delivery_out"
  | "stock.manual_adjustment"
  | "postsale.created"
  | "postsale.updated"
  | "postsale.closed"
  | "proof.created"
  | "automation.created"
  | "automation.toggled"
  | "template.created"
  | "outbound.sent"
  | "outbound.failed"
  | "outbound.retried"
  | "outbound.cancelled"
  | "plan.changed"
  | "subscription.cancelled"
  | "subscription.reactivated"
  | "export.requested"
  | "deletion.requested"
  | "deletion.approved"
  | "mfa.enabled"
  | "mfa.disabled"
  | "security.login_failed"
  | "security.admin_access";

export type ActivityEntity =
  | "PurchaseOrder"
  | "Reception"
  | "Incident"
  | "Delivery"
  | "Product"
  | "Supplier"
  | "Vehicle"
  | "User"
  | "Customer"
  | "SupplierInvoice"
  | "Notification"
  | "SalesOrder"
  | "ProductInventory"
  | "PostSaleTicket"
  | "DeliveryProof"
  | "FileAsset"
  | "AutomationRule"
  | "NotificationTemplate"
  | "OutboundMessage"
  | "CustomerInvoice"
  | "SubscriptionPlan"
  | "TenantSubscription"
  | "BillingInvoice"
  | "DataExportRequest"
  | "DataDeletionRequest"
  | "SecurityEvent"
  | "UserMfa"
  | "BackupJob";

type LogInput = {
  tenantId: string;
  userId?: string | null;
  userName?: string | null;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  entityRef?: string;
  details?: Record<string, unknown>;
};

export async function log(input: LogInput) {
  try {
    await db.activityLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId || null,
        userName: input.userName || null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId || null,
        entityRef: input.entityRef || null,
        details: (input.details ?? undefined) as object | undefined,
      },
    });
  } catch (e) {
    // Don't fail the main operation if logging fails
    console.error("[activity.log] failed:", e);
  }
}

export async function listForEntity(tenantId: string, entity: string, entityId: string) {
  return db.activityLog.findMany({
    where: { tenantId, entity, entityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listRecent(tenantId: string, limit = 50) {
  return db.activityLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
