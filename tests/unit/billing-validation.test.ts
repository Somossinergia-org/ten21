import { describe, it, expect } from "vitest";
import { changePlanSchema, createPlanSchema } from "@/lib/validations/billing";

describe("changePlanSchema", () => {
  it("accepts valid plan code", () => {
    expect(changePlanSchema.safeParse({ planCode: "pro" }).success).toBe(true);
  });

  it("rejects empty planCode", () => {
    expect(changePlanSchema.safeParse({ planCode: "" }).success).toBe(false);
  });
});

describe("createPlanSchema", () => {
  it("accepts valid plan", () => {
    const result = createPlanSchema.safeParse({
      code: "starter",
      name: "Starter",
      billingCycle: "MONTHLY",
      priceCents: 4900,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.currency).toBe("EUR");
  });

  it("rejects invalid billing cycle", () => {
    expect(createPlanSchema.safeParse({
      code: "test", name: "Test",
      billingCycle: "WEEKLY", priceCents: 100,
    }).success).toBe(false);
  });

  it("rejects negative price", () => {
    expect(createPlanSchema.safeParse({
      code: "test", name: "Test",
      billingCycle: "MONTHLY", priceCents: -100,
    }).success).toBe(false);
  });

  it("accepts plan with limits", () => {
    const result = createPlanSchema.safeParse({
      code: "pro", name: "Pro",
      billingCycle: "YEARLY", priceCents: 199900,
      limitsJson: { users_active: 50, products: 10000 },
    });
    expect(result.success).toBe(true);
  });
});
