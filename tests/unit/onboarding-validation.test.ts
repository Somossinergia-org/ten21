import { describe, it, expect } from "vitest";
import { advanceOnboardingSchema } from "@/lib/validations/onboarding";

describe("advanceOnboardingSchema", () => {
  it("accepts valid step", () => {
    expect(advanceOnboardingSchema.safeParse({ step: 3 }).success).toBe(true);
  });

  it("rejects step > 6", () => {
    expect(advanceOnboardingSchema.safeParse({ step: 7 }).success).toBe(false);
  });

  it("rejects negative step", () => {
    expect(advanceOnboardingSchema.safeParse({ step: -1 }).success).toBe(false);
  });

  it("accepts step with data", () => {
    expect(advanceOnboardingSchema.safeParse({
      step: 1,
      data: { businessName: "Test" },
    }).success).toBe(true);
  });
});
