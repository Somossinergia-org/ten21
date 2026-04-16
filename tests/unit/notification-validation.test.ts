import { describe, it, expect } from "vitest";
import { createNotificationSchema, notificationTypeEnum, notificationSeverityEnum } from "@/lib/validations/notification";

describe("notificationTypeEnum", () => {
  it("accepts valid types", () => {
    const types = ["INCIDENT_CREATED", "DELIVERY_FAILED", "ORDER_PARTIAL", "INVOICE_MISMATCH", "SYSTEM"];
    for (const type of types) {
      expect(notificationTypeEnum.safeParse(type).success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    expect(notificationTypeEnum.safeParse("UNKNOWN").success).toBe(false);
  });
});

describe("notificationSeverityEnum", () => {
  it("accepts valid severities", () => {
    for (const s of ["LOW", "MEDIUM", "HIGH"]) {
      expect(notificationSeverityEnum.safeParse(s).success).toBe(true);
    }
  });
});

describe("createNotificationSchema", () => {
  it("accepts valid notification", () => {
    const result = createNotificationSchema.safeParse({
      type: "INCIDENT_CREATED",
      title: "Nueva incidencia",
      message: "Se detectaron 2 incidencias en REC-002",
      severity: "HIGH",
    });
    expect(result.success).toBe(true);
  });

  it("defaults severity to MEDIUM", () => {
    const result = createNotificationSchema.safeParse({
      type: "SYSTEM",
      title: "Test",
      message: "Test message",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.severity).toBe("MEDIUM");
    }
  });

  it("rejects empty title", () => {
    const result = createNotificationSchema.safeParse({
      type: "SYSTEM",
      title: "",
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional entity fields", () => {
    const result = createNotificationSchema.safeParse({
      type: "DELIVERY_FAILED",
      title: "Entrega fallida",
      message: "ENT-001 no pudo entregarse",
      entityType: "Delivery",
      entityId: "del123",
      userId: "user123",
    });
    expect(result.success).toBe(true);
  });
});
