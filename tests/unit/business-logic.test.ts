import { describe, it, expect } from "vitest";
import { compareLineForIncidents } from "@/services/reception.service";
import { resolveCustomer } from "@/lib/domain/customer-resolver";

describe("V8 Business Logic — Reception → Incidents", () => {
  it("creates QUANTITY_MISMATCH when received < expected", () => {
    const incidents = compareLineForIncidents(
      { purchaseOrderLineId: "line1", quantityExpected: 10, quantityReceived: 7, quantityDamaged: 0 },
      "LAV-001", "Lavadora Samsung"
    );
    expect(incidents.length).toBe(1);
    expect(incidents[0].type).toBe("QUANTITY_MISMATCH");
    expect(incidents[0].description).toContain("faltan");
  });

  it("creates QUANTITY_MISMATCH when received > expected", () => {
    const incidents = compareLineForIncidents(
      { purchaseOrderLineId: "line1", quantityExpected: 5, quantityReceived: 8, quantityDamaged: 0 },
      "LAV-001", "Lavadora Samsung"
    );
    expect(incidents.length).toBe(1);
    expect(incidents[0].type).toBe("QUANTITY_MISMATCH");
    expect(incidents[0].description).toContain("sobran");
  });

  it("creates DAMAGED when damaged > 0", () => {
    const incidents = compareLineForIncidents(
      { purchaseOrderLineId: "line1", quantityExpected: 10, quantityReceived: 10, quantityDamaged: 2 },
      "LAV-001", "Lavadora Samsung"
    );
    expect(incidents.length).toBe(1);
    expect(incidents[0].type).toBe("DAMAGED");
  });

  it("creates both incidents when quantity mismatch AND damage", () => {
    const incidents = compareLineForIncidents(
      { purchaseOrderLineId: "line1", quantityExpected: 10, quantityReceived: 7, quantityDamaged: 2 },
      "LAV-001", "Lavadora Samsung"
    );
    expect(incidents.length).toBe(2);
    const types = incidents.map((i) => i.type).sort();
    expect(types).toEqual(["DAMAGED", "QUANTITY_MISMATCH"]);
  });

  it("creates NO incidents when perfect reception", () => {
    const incidents = compareLineForIncidents(
      { purchaseOrderLineId: "line1", quantityExpected: 10, quantityReceived: 10, quantityDamaged: 0 },
      "LAV-001", "Lavadora Samsung"
    );
    expect(incidents.length).toBe(0);
  });
});

describe("V8 Business Logic — Customer Resolver", () => {
  it("prefers Customer entity when available", () => {
    const resolved = resolveCustomer({
      customerId: "cust123",
      customerName: "[Legacy] Name",
      customerPhone: "000",
      customerAddress: "Legacy address",
      customer: {
        id: "cust123",
        fullName: "Carmen Rodriguez",
        phone: "658112233",
        email: "carmen@test.com",
        addressLine1: "C/ Mayor 15",
        city: "Guardamar",
      },
    });
    expect(resolved.source).toBe("customer_entity");
    expect(resolved.fullName).toBe("Carmen Rodriguez");
    expect(resolved.phone).toBe("658112233");
  });

  it("falls back to legacy inline fields when no customer entity", () => {
    const resolved = resolveCustomer({
      customerId: null,
      customerName: "Legacy Customer",
      customerPhone: "123456",
      customerAddress: "C/ Legacy 1",
    });
    expect(resolved.source).toBe("legacy_inline");
    expect(resolved.fullName).toBe("Legacy Customer");
    expect(resolved.id).toBeNull();
  });

  it("handles missing phone gracefully", () => {
    const resolved = resolveCustomer({
      customerName: "Name Only",
      customerAddress: "Address Only",
    });
    expect(resolved.phone).toBeNull();
  });
});
