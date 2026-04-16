import { describe, it, expect } from "vitest";
import type { ActivityAction, ActivityEntity } from "@/services/activity.service";

describe("ActivityAction type coverage", () => {
  it("includes all V5 actions", () => {
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
      "sale.created", "sale.confirmed", "sale.cancelled", "sale.delivered",
      "stock.reception_in", "stock.sale_reserve", "stock.sale_release",
      "stock.delivery_out", "stock.manual_adjustment",
      "postsale.created", "postsale.updated", "postsale.closed",
      "proof.created",
      "automation.created", "automation.toggled",
      "template.created",
      "outbound.sent", "outbound.failed", "outbound.retried", "outbound.cancelled",
    ];
    expect(actions.length).toBe(46);
  });

  it("includes all V5 entities", () => {
    const entities: ActivityEntity[] = [
      "PurchaseOrder", "Reception", "Incident", "Delivery",
      "Product", "Supplier", "Vehicle",
      "User", "Customer", "SupplierInvoice", "Notification",
      "SalesOrder", "ProductInventory", "PostSaleTicket",
      "DeliveryProof", "FileAsset",
      "AutomationRule", "NotificationTemplate", "OutboundMessage",
      "CustomerInvoice",
    ];
    expect(entities.length).toBe(20);
  });
});
