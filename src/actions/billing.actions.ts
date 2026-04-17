"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { changePlanSchema } from "@/lib/validations/billing";
import * as billingService from "@/services/billing.service";
import * as activity from "@/services/activity.service";
import { isStripeConfigured, createCheckoutSession, createBillingPortalSession } from "@/lib/billing/stripe-provider";

type ActionResult = { success: boolean; error?: string };

export async function changePlanAction(data: { planCode: string }): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = changePlanSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await billingService.changePlan(tenantId, parsed.data.planCode);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "customer.updated", entity: "Customer",
      entityId: tenantId, details: { action: "plan_changed", planCode: parsed.data.planCode },
    });
    revalidatePath("/settings/billing");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await billingService.cancelAtPeriodEnd(tenantId);
    revalidatePath("/settings/billing");
    return { success: true };
  } catch (e: unknown) { return { success: false, error: e instanceof Error ? e.message : "Error" }; }
}

export async function reactivateSubscriptionAction(): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  try {
    await billingService.reactivateSubscription(tenantId);
    revalidatePath("/settings/billing");
    return { success: true };
  } catch (e: unknown) { return { success: false, error: e instanceof Error ? e.message : "Error" }; }
}

export async function createCheckoutAction(priceId: string): Promise<ActionResult & { url?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  if (!isStripeConfigured()) {
    return { success: false, error: "Stripe no esta configurado. Contacta con soporte." };
  }

  try {
    const session = await createCheckoutSession(
      tenantId, priceId,
      `${process.env.NEXTAUTH_URL || ""}/settings/billing?success=1`,
      `${process.env.NEXTAUTH_URL || ""}/settings/billing?cancel=1`,
    );
    return { success: true, url: session.url };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear checkout" };
  }
}

export async function openBillingPortalAction(): Promise<ActionResult & { url?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  if (!isStripeConfigured()) {
    return { success: false, error: "Stripe no esta configurado" };
  }

  try {
    const session = await createBillingPortalSession(
      tenantId,
      `${process.env.NEXTAUTH_URL || ""}/settings/billing`,
    );
    return { success: true, url: session.url };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
