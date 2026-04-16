import { db } from "@/lib/db";
import type { SubscriptionStatus } from "@prisma/client";

export async function listPlans() {
  return db.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });
}

export async function getTenantSubscription(tenantId: string) {
  return db.tenantSubscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });
}

export async function ensureSubscription(tenantId: string) {
  const existing = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (existing) return existing;

  // Assign default Starter plan in trial
  const plan = await db.subscriptionPlan.findFirst({
    where: { code: "starter", active: true },
  });
  if (!plan) throw new Error("Plan starter no configurado");

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 30 * 86400000);

  return db.tenantSubscription.create({
    data: {
      tenantId, planId: plan.id,
      status: "TRIAL",
      trialStartsAt: now, trialEndsAt: trialEnd,
    },
    include: { plan: true },
  });
}

export async function changePlan(tenantId: string, planCode: string) {
  const plan = await db.subscriptionPlan.findUnique({ where: { code: planCode } });
  if (!plan) throw new Error("Plan no encontrado");

  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub) throw new Error("Suscripcion no encontrada");

  await db.tenant.update({
    where: { id: tenantId },
    data: { planCode },
  });

  return db.tenantSubscription.update({
    where: { id: sub.id },
    data: { planId: plan.id },
    include: { plan: true },
  });
}

export async function cancelAtPeriodEnd(tenantId: string) {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub) throw new Error("Sin suscripcion");
  return db.tenantSubscription.update({
    where: { id: sub.id },
    data: { cancelAtPeriodEnd: true, cancelledAt: new Date() },
  });
}

export async function pauseSubscription(tenantId: string) {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub) throw new Error("Sin suscripcion");
  return db.tenantSubscription.update({
    where: { id: sub.id },
    data: { status: "PAUSED", pausedAt: new Date() },
  });
}

export async function reactivateSubscription(tenantId: string) {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub) throw new Error("Sin suscripcion");
  return db.tenantSubscription.update({
    where: { id: sub.id },
    data: { status: "ACTIVE", reactivatedAt: new Date(), pausedAt: null },
  });
}

export async function listInvoices(tenantId: string) {
  return db.billingInvoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function resolveLimits(tenantId: string): Promise<Record<string, number>> {
  const sub = await db.tenantSubscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });
  if (!sub?.plan?.limitsJson) return {};
  return sub.plan.limitsJson as Record<string, number>;
}

export async function isRestricted(tenantId: string): Promise<{ isRestricted: boolean; reason?: string }> {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub) return { isRestricted: false };

  if (sub.status === "PAST_DUE") return { isRestricted: true, reason: "Suscripcion con pago pendiente" };
  if (sub.status === "EXPIRED") return { isRestricted: true, reason: "Trial o suscripcion expirada" };
  if (sub.status === "CANCELLED") return { isRestricted: true, reason: "Suscripcion cancelada" };

  return { isRestricted: false };
}

// Webhook idempotency
export async function processWebhookEvent(externalEventId: string, type: string, payload: object) {
  const existing = await db.billingEvent.findUnique({
    where: { source_externalEventId: { source: "WEBHOOK", externalEventId } },
  });
  if (existing?.processed) return { alreadyProcessed: true, event: existing };

  const event = existing || await db.billingEvent.create({
    data: {
      source: "WEBHOOK", externalEventId, type,
      payloadJson: payload as object,
    },
  });

  // Process event type (placeholder: real logic depends on provider)
  await db.billingEvent.update({
    where: { id: event.id },
    data: { processed: true, processedAt: new Date() },
  });

  return { alreadyProcessed: false, event };
}
