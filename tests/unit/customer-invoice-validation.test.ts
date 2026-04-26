import { describe, it, expect } from "vitest";
import { createCustomerInvoiceSchema, customerInvoiceLineSchema, markInvoicePaidSchema } from "@/lib/validations/customer-invoice";

describe("customerInvoiceLineSchema", () => {
  it("accepts valid line", () => {
    const result = customerInvoiceLineSchema.safeParse({
      description: "Sofa 3 plazas",
      quantity: 1,
      unitPrice: 450,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxRate).toBe(21);
  });

  it("allows custom tax rate", () => {
    const result = customerInvoiceLineSchema.safeParse({
      description: "Transporte",
      quantity: 1,
      unitPrice: 30,
      taxRate: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxRate).toBe(10);
  });

  it("rejects negative unitPrice", () => {
    expect(customerInvoiceLineSchema.safeParse({
      description: "Test", quantity: 1, unitPrice: -10,
    }).success).toBe(false);
  });
});

describe("createCustomerInvoiceSchema", () => {
  it("accepts valid invoice", () => {
    const result = createCustomerInvoiceSchema.safeParse({
      customerId: "cust123",
      lines: [{ description: "Mesa", quantity: 1, unitPrice: 380 }],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one line", () => {
    expect(createCustomerInvoiceSchema.safeParse({
      customerId: "cust123",
      lines: [],
    }).success).toBe(false);
  });

  it("requires customerId", () => {
    expect(createCustomerInvoiceSchema.safeParse({
      lines: [{ description: "Test", quantity: 1, unitPrice: 100 }],
    }).success).toBe(false);
  });
});

describe("markInvoicePaidSchema", () => {
  it("accepts valid payment", () => {
    expect(markInvoicePaidSchema.safeParse({
      invoiceId: "inv123", amount: 450.50,
    }).success).toBe(true);
  });

  it("rejects zero amount", () => {
    expect(markInvoicePaidSchema.safeParse({
      invoiceId: "inv123", amount: 0,
    }).success).toBe(false);
  });
});
