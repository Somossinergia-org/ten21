import { describe, it, expect } from "vitest";
import type { ActivityAction, ActivityEntity } from "@/services/activity.service";

describe("ActivityAction type coverage", () => {
  it("includes all V2 actions", () => {
    // Type-level test: these assignments should compile without error
    const actions: ActivityAction[] = [
      "purchase.created", "purchase.sent",
      "reception.created", "reception.completed",
      "incident.created", "incident.notified", "incident.reviewed", "incident.closed",
      "delivery.created", "delivery.started", "delivery.completed", "delivery.failed",
      "product.created", "product.updated",
      "supplier.created", "supplier.updated",
      "vehicle.created", "vehicle.updated", "vehicle.synced",
      "user.created", "user.updated",
      "customer.created", "customer.updated",
      "invoice.created", "invoice.reconciled",
      "notification.created",
    ];
    expect(actions.length).toBe(26);
  });

  it("includes all V2 entities", () => {
    const entities: ActivityEntity[] = [
      "PurchaseOrder", "Reception", "Incident", "Delivery",
      "Product", "Supplier", "Vehicle",
      "User", "Customer", "SupplierInvoice", "Notification",
    ];
    expect(entities.length).toBe(11);
  });
});
