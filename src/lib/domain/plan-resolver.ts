/**
 * V8: Plan truth resolver.
 *
 * SINGLE SOURCE OF TRUTH: TenantSubscription (with SubscriptionPlan relation).
 * Tenant.planCode is kept as a SNAPSHOT/CACHE for display purposes only.
 * Always consult TenantSubscription for gating, limits, and billing.
 */

import { db } from "@/lib/db";

export type ResolvedPlan = {
  planCode: string | null;
  planName: string;
  status: string;
  isTrial: boolean;
  isActive: boolean;
  isRestricted: boolean;
  limits: Record<string, number>;
  features: Record<string, unknown>;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
};

export async function resolvePlan(tenantId: string): Promise<ResolvedPlan> {
  const sub = await db.tenantSubscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });

  if (!sub || !sub.plan) {
    return {
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
  }

  const restricted = ["PAST_DUE", "EXPIRED", "CANCELLED"].includes(sub.status);

  return {
    planCode: sub.plan.code,
    planName: sub.plan.name,
    status: sub.status,
    isTrial: sub.status === "TRIAL",
    isActive: sub.status === "ACTIVE",
    isRestricted: restricted,
    limits: (sub.plan.limitsJson as Record<string, number>) || {},
    features: (sub.plan.featuresJson as Record<string, unknown>) || {},
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}
