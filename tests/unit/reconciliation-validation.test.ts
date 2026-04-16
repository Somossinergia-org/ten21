import { describe, it, expect } from "vitest";
import { reconcileInvoiceSchema, reconciliationStatusEnum } from "@/lib/validations/invoice-reconciliation";

describe("reconciliationStatusEnum", () => {
  it("accepts valid statuses", () => {
    for (const s of ["NOT_CHECKED", "MATCHED", "MISMATCHED"]) {
      expect(reconciliationStatusEnum.safeParse(s).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(reconciliationStatusEnum.safeParse("PENDING").success).toBe(false);
  });
});

describe("reconcileInvoiceSchema", () => {
  it("accepts valid reconciliation", () => {
    const result = reconcileInvoiceSchema.safeParse({
      invoiceId: "inv123",
      purchaseOrderId: "po123",
    });
    expect(result.success).toBe(true);
  });

  it("requires invoiceId", () => {
    const result = reconcileInvoiceSchema.safeParse({
      purchaseOrderId: "po123",
    });
    expect(result.success).toBe(false);
  });

  it("requires purchaseOrderId", () => {
    const result = reconcileInvoiceSchema.safeParse({
      invoiceId: "inv123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional mismatchReason", () => {
    const result = reconcileInvoiceSchema.safeParse({
      invoiceId: "inv123",
      purchaseOrderId: "po123",
      mismatchReason: "Importe no coincide con albarán",
    });
    expect(result.success).toBe(true);
  });
});
