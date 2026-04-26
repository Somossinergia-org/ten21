import { describe, it, expect } from "vitest";
import { createManualTreasurySchema, markTreasuryPaidSchema } from "@/lib/validations/treasury";

describe("createManualTreasurySchema", () => {
  it("accepts expense entry", () => {
    const result = createManualTreasurySchema.safeParse({
      type: "EXPENSE_EXPECTED",
      concept: "Pago alquiler local",
      amount: 1200,
    });
    expect(result.success).toBe(true);
  });

  it("accepts income entry with dueDate", () => {
    const result = createManualTreasurySchema.safeParse({
      type: "INCOME_EXPECTED",
      concept: "Cobro cliente pendiente",
      amount: 850.50,
      dueDate: "2026-05-01",
      category: "Cobros",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(createManualTreasurySchema.safeParse({
      type: "INVALID",
      concept: "Test",
      amount: 100,
    }).success).toBe(false);
  });

  it("rejects zero amount", () => {
    expect(createManualTreasurySchema.safeParse({
      type: "EXPENSE_EXPECTED",
      concept: "Test",
      amount: 0,
    }).success).toBe(false);
  });

  it("requires concept", () => {
    expect(createManualTreasurySchema.safeParse({
      type: "EXPENSE_EXPECTED",
      concept: "",
      amount: 100,
    }).success).toBe(false);
  });
});

describe("markTreasuryPaidSchema", () => {
  it("accepts valid marking", () => {
    expect(markTreasuryPaidSchema.safeParse({
      entryId: "entry123",
    }).success).toBe(true);
  });

  it("accepts with optional date", () => {
    expect(markTreasuryPaidSchema.safeParse({
      entryId: "entry123",
      paidDate: "2026-04-16",
      notes: "Pagado por transferencia",
    }).success).toBe(true);
  });
});
