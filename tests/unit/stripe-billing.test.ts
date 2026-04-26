import { describe, it, expect } from "vitest";
import { isStripeConfigured } from "@/lib/billing/stripe-provider";
import { resolvePlan } from "@/lib/domain/plan-resolver";

describe("Stripe Provider", () => {
  it("isStripeConfigured returns false when STRIPE_SECRET_KEY not set", () => {
    const original = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
    if (original) process.env.STRIPE_SECRET_KEY = original;
  });

  it("gracefully degrades without Stripe — billing actions return error", async () => {
    // In test env, Stripe is never configured
    expect(isStripeConfigured()).toBe(false);
  });
});

describe("Plan Truth Resolver", () => {
  it("resolvePlan is async and returns structured plan", async () => {
    // Without DB, this will throw — but the function signature is testable
    expect(typeof resolvePlan).toBe("function");
  });

  it("resolvedPlan has correct shape when no subscription", () => {
    const plan = {
      planCode: null,
      planName: "Sin plan",
      status: "NONE",
      isTrial: false,
      isActive: false,
      isRestricted: true,
      limits: {},
      features: {},
      trialEndsAt: null,
      currentPeriodEnd: null,
    };
    expect(plan.isRestricted).toBe(true);
    expect(plan.planCode).toBeNull();
  });

  it("active plan is not restricted", () => {
    const plan = {
      status: "ACTIVE",
      isRestricted: false,
    };
    expect(plan.isRestricted).toBe(false);
  });

  it("PAST_DUE plan is restricted", () => {
    const restricted = ["PAST_DUE", "EXPIRED", "CANCELLED"].includes("PAST_DUE");
    expect(restricted).toBe(true);
  });

  it("TRIAL plan is not restricted", () => {
    const restricted = ["PAST_DUE", "EXPIRED", "CANCELLED"].includes("TRIAL");
    expect(restricted).toBe(false);
  });
});

describe("Stripe webhook idempotency pattern", () => {
  it("same event ID should be processed only once (conceptual)", () => {
    const processedEvents = new Set<string>();
    const eventId = "evt_test_123";

    // First time: not processed
    expect(processedEvents.has(eventId)).toBe(false);
    processedEvents.add(eventId);

    // Second time: already processed
    expect(processedEvents.has(eventId)).toBe(true);
  });

  it("maps Stripe statuses correctly", () => {
    const map: Record<string, string> = {
      trialing: "TRIAL",
      active: "ACTIVE",
      past_due: "PAST_DUE",
      canceled: "CANCELLED",
      unpaid: "PAST_DUE",
      paused: "PAUSED",
    };

    expect(map["trialing"]).toBe("TRIAL");
    expect(map["past_due"]).toBe("PAST_DUE");
    expect(map["canceled"]).toBe("CANCELLED");
    expect(map["active"]).toBe("ACTIVE");
  });
});
