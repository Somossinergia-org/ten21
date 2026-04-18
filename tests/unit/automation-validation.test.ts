import { describe, it, expect } from "vitest";
import { createAutomationRuleSchema, createTemplateSchema } from "@/lib/validations/automation";

describe("createAutomationRuleSchema", () => {
  it("accepts valid rule", () => {
    const result = createAutomationRuleSchema.safeParse({
      code: "notify-delivery",
      eventType: "DELIVERY_DELIVERED",
      channel: "EMAIL",
      target: "CUSTOMER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    expect(createAutomationRuleSchema.safeParse({
      code: "test",
      eventType: "INVALID_EVENT",
      channel: "EMAIL",
      target: "USER",
    }).success).toBe(false);
  });

  it("rejects invalid channel", () => {
    expect(createAutomationRuleSchema.safeParse({
      code: "test",
      eventType: "DELIVERY_FAILED",
      channel: "SMS",
      target: "USER",
    }).success).toBe(false);
  });

  it("accepts all valid event types", () => {
    const events = ["DELIVERY_ASSIGNED", "DELIVERY_IN_TRANSIT", "DELIVERY_FAILED",
      "DELIVERY_DELIVERED", "POST_SALE_URGENT", "INVOICE_OVERDUE"];
    for (const e of events) {
      expect(createAutomationRuleSchema.safeParse({
        code: `rule-${e}`, eventType: e, channel: "PUSH", target: "ROLE",
      }).success).toBe(true);
    }
  });
});

describe("createTemplateSchema", () => {
  it("accepts valid template", () => {
    const result = createTemplateSchema.safeParse({
      code: "delivery-complete",
      channel: "EMAIL",
      eventType: "DELIVERY_DELIVERED",
      subject: "Tu entrega ha llegado",
      body: "Hola, tu pedido ha sido entregado correctamente.",
    });
    expect(result.success).toBe(true);
  });

  it("requires body", () => {
    expect(createTemplateSchema.safeParse({
      code: "test",
      channel: "PUSH",
      eventType: "test",
      body: "",
    }).success).toBe(false);
  });
});
