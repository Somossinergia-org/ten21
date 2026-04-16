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
  | "supplier.created"
  | "vehicle.synced";

export type ActivityEntity =
  | "PurchaseOrder"
  | "Reception"
  | "Incident"
  | "Delivery"
  | "Product"
  | "Supplier"
  | "Vehicle";

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
