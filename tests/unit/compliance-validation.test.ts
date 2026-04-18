import { describe, it, expect } from "vitest";
import { dataExportRequestSchema, dataDeletionRequestSchema, approveDeletionSchema } from "@/lib/validations/compliance";

describe("dataExportRequestSchema", () => {
  it("accepts all valid types", () => {
    for (const t of ["FULL_EXPORT", "GDPR_EXPORT", "AUDIT_EXPORT"]) {
      expect(dataExportRequestSchema.safeParse({ type: t }).success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    expect(dataExportRequestSchema.safeParse({ type: "INVALID" }).success).toBe(false);
  });

  it("accepts optional reason", () => {
    expect(dataExportRequestSchema.safeParse({
      type: "GDPR_EXPORT",
      reason: "Peticion del cliente",
    }).success).toBe(true);
  });
});

describe("dataDeletionRequestSchema", () => {
  it("accepts CUSTOMER_DATA", () => {
    const result = dataDeletionRequestSchema.safeParse({
      type: "CUSTOMER_DATA",
      targetEntityType: "Customer",
      targetEntityId: "cust123",
      reason: "Cliente solicita borrado",
    });
    expect(result.success).toBe(true);
  });

  it("requires reason", () => {
    expect(dataDeletionRequestSchema.safeParse({
      type: "CUSTOMER_DATA",
      reason: "",
    }).success).toBe(false);
  });

  it("accepts TENANT_DATA", () => {
    expect(dataDeletionRequestSchema.safeParse({
      type: "TENANT_DATA",
      reason: "Fin de servicio",
    }).success).toBe(true);
  });
});

describe("approveDeletionSchema", () => {
  it("accepts approval", () => {
    expect(approveDeletionSchema.safeParse({
      requestId: "req123",
      approved: true,
    }).success).toBe(true);
  });

  it("accepts rejection", () => {
    expect(approveDeletionSchema.safeParse({
      requestId: "req123",
      approved: false,
    }).success).toBe(true);
  });
});
