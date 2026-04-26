import { describe, it, expect } from "vitest";
import { createSalesOrderSchema, salesOrderLineSchema } from "@/lib/validations/sales";

describe("salesOrderLineSchema", () => {
  it("accepts valid line with product", () => {
    const result = salesOrderLineSchema.safeParse({
      productId: "prod123",
      description: "Sofa 3 plazas",
      quantity: 2,
      unitSalePrice: 450.00,
      unitExpectedCost: 320.00,
    });
    expect(result.success).toBe(true);
  });

  it("accepts manual line without product", () => {
    const result = salesOrderLineSchema.safeParse({
      description: "Servicio de transporte",
      quantity: 1,
      unitSalePrice: 50.00,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = salesOrderLineSchema.safeParse({
      description: "",
      quantity: 1,
      unitSalePrice: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity 0", () => {
    const result = salesOrderLineSchema.safeParse({
      description: "Test",
      quantity: 0,
      unitSalePrice: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = salesOrderLineSchema.safeParse({
      description: "Test",
      quantity: 1,
      unitSalePrice: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("createSalesOrderSchema", () => {
  it("accepts valid sales order", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: "cust123",
      lines: [{ description: "Mesa comedor", quantity: 1, unitSalePrice: 380 }],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one line", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: "cust123",
      lines: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires customerId", () => {
    const result = createSalesOrderSchema.safeParse({
      lines: [{ description: "Test", quantity: 1, unitSalePrice: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it("defaults discountTotal to 0", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: "cust123",
      lines: [{ description: "Test", quantity: 1, unitSalePrice: 100 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountTotal).toBe(0);
    }
  });

  it("accepts optional fields", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: "cust123",
      notes: "Entrega urgente",
      scheduledDeliveryDate: "2026-05-01",
      discountTotal: 25,
      lines: [
        { productId: "p1", description: "Sofa", quantity: 1, unitSalePrice: 450, unitExpectedCost: 300 },
        { description: "Transporte", quantity: 1, unitSalePrice: 30 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lines.length).toBe(2);
      expect(result.data.discountTotal).toBe(25);
    }
  });
});
