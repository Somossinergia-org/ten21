import { describe, it, expect } from "vitest";
import { createPurchaseOrderSchema } from "@/lib/validations/purchase";
import { createReceptionSchema } from "@/lib/validations/reception";
import { createDeliverySchema } from "@/lib/validations/delivery";
import { transitionIncidentSchema } from "@/lib/validations/incident";

describe("Purchase order validation", () => {
  it("accepts valid input", () => {
    const result = createPurchaseOrderSchema.safeParse({
      supplierId: "abc123",
      type: "SALE",
      lines: [{ productId: "p1", quantityOrdered: 3, expectedUnitCost: 100 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty lines", () => {
    const result = createPurchaseOrderSchema.safeParse({
      supplierId: "abc123",
      type: "SALE",
      lines: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing supplierId", () => {
    const result = createPurchaseOrderSchema.safeParse({
      supplierId: "",
      type: "SALE",
      lines: [{ productId: "p1", quantityOrdered: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero quantity", () => {
    const result = createPurchaseOrderSchema.safeParse({
      supplierId: "abc",
      type: "SALE",
      lines: [{ productId: "p1", quantityOrdered: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts EXHIBITION type", () => {
    const result = createPurchaseOrderSchema.safeParse({
      supplierId: "abc",
      type: "EXHIBITION",
      lines: [{ productId: "p1", quantityOrdered: 1 }],
    });
    expect(result.success).toBe(true);
  });
});

describe("Reception validation", () => {
  it("accepts valid input", () => {
    const result = createReceptionSchema.safeParse({
      purchaseOrderId: "po1",
      lines: [
        { purchaseOrderLineId: "l1", quantityExpected: 5, quantityReceived: 3, quantityDamaged: 0 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty lines", () => {
    const result = createReceptionSchema.safeParse({
      purchaseOrderId: "po1",
      lines: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantities", () => {
    const result = createReceptionSchema.safeParse({
      purchaseOrderId: "po1",
      lines: [
        { purchaseOrderLineId: "l1", quantityExpected: 5, quantityReceived: -1, quantityDamaged: 0 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("Delivery validation", () => {
  it("accepts valid input", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "Antonio Martinez",
      customerAddress: "C/ Gran Via 45",
      description: "Lavadora Samsung 8kg",
      vehicleId: "v1",
      assignedToId: "u1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing customer name", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "",
      customerAddress: "C/ Gran Via",
      description: "Lavadora",
      vehicleId: "v1",
      assignedToId: "u1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing vehicle", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "Test",
      customerAddress: "Test",
      description: "Test",
      vehicleId: "",
      assignedToId: "u1",
    });
    expect(result.success).toBe(false);
  });
});

describe("Incident transition validation", () => {
  it("accepts NOTIFIED", () => {
    const result = transitionIncidentSchema.safeParse({
      incidentId: "inc1",
      newStatus: "NOTIFIED",
    });
    expect(result.success).toBe(true);
  });

  it("accepts CLOSED with resolution", () => {
    const result = transitionIncidentSchema.safeParse({
      incidentId: "inc1",
      newStatus: "CLOSED",
      resolution: "Proveedor envio reposicion",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = transitionIncidentSchema.safeParse({
      incidentId: "inc1",
      newStatus: "REGISTERED",
    });
    expect(result.success).toBe(false);
  });
});
