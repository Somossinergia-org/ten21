import { db } from "@/lib/db";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

async function stripeRequest(path: string, method = "GET", body?: object) {
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe not configured");
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body as Record<string, string>).toString() : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Stripe error ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

export async function createCheckoutSession(tenantId: string, priceId: string, successUrl: string, cancelUrl: string) {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  let customerId = sub?.providerCustomerId;

  if (!customerId) {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    const customer = await stripeRequest("/customers", "POST", {
      name: tenant?.name || "Tenant",
      metadata: { tenantId },
    } as unknown as object);
    customerId = customer.id;
    if (sub) {
      await db.tenantSubscription.update({
        where: { id: sub.id },
        data: { providerCustomerId: customerId, provider: "STRIPE" },
      });
    }
  }

  return stripeRequest("/checkout/sessions", "POST", {
    customer: customerId,
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "metadata[tenantId]": tenantId,
  } as unknown as object);
}

export async function createBillingPortalSession(tenantId: string, returnUrl: string) {
  const sub = await db.tenantSubscription.findUnique({ where: { tenantId } });
  if (!sub?.providerCustomerId) throw new Error("No Stripe customer linked");

  return stripeRequest("/billing_portal/sessions", "POST", {
    customer: sub.providerCustomerId,
    return_url: returnUrl,
  } as unknown as object);
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!STRIPE_WEBHOOK_SECRET) return false;

  const crypto = require("crypto");
  const parts = signature.split(",").reduce((acc: Record<string, string>, part: string) => {
    const [key, val] = part.split("=");
    acc[key] = val;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  if (!timestamp || !expectedSig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const computed = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expectedSig));
}

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export async function handleWebhookEvent(event: StripeEvent) {
  // Idempotency via BillingEvent
  const existing = await db.billingEvent.findUnique({
    where: { source_externalEventId: { source: "WEBHOOK", externalEventId: event.id } },
  });
  if (existing?.processed) return { alreadyProcessed: true };

  const billingEvent = existing || await db.billingEvent.create({
    data: {
      source: "WEBHOOK",
      externalEventId: event.id,
      type: event.type,
      payloadJson: event.data.object as object,
    },
  });

  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const tenantId = (obj.metadata as Record<string, string>)?.tenantId;
      const subId = obj.subscription as string;
      const custId = obj.customer as string;
      if (tenantId && subId) {
        await db.tenantSubscription.updateMany({
          where: { tenantId },
          data: {
            status: "ACTIVE",
            provider: "STRIPE",
            providerCustomerId: custId,
            providerSubscriptionId: subId,
            currentPeriodStart: new Date(),
          },
        });
        await db.tenant.update({
          where: { id: tenantId },
          data: { planCode: "active" },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subId = obj.id as string;
      const status = obj.status as string;
      const sub = await db.tenantSubscription.findFirst({
        where: { providerSubscriptionId: subId },
      });
      if (sub) {
        const mapped = mapStripeStatus(status);
        await db.tenantSubscription.update({
          where: { id: sub.id },
          data: {
            status: mapped,
            currentPeriodEnd: obj.current_period_end
              ? new Date((obj.current_period_end as number) * 1000)
              : undefined,
            cancelAtPeriodEnd: (obj.cancel_at_period_end as boolean) || false,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subId = obj.id as string;
      await db.tenantSubscription.updateMany({
        where: { providerSubscriptionId: subId },
        data: { status: "EXPIRED", cancelledAt: new Date() },
      });
      break;
    }

    case "invoice.paid": {
      const custId = obj.customer as string;
      const sub = await db.tenantSubscription.findFirst({
        where: { providerCustomerId: custId },
      });
      if (sub) {
        await db.billingInvoice.create({
          data: {
            tenantId: sub.tenantId,
            tenantSubscriptionId: sub.id,
            externalInvoiceId: obj.id as string,
            status: "PAID",
            amountCents: (obj.amount_paid as number) || 0,
            currency: (obj.currency as string) || "eur",
            paidAt: new Date(),
            hostedUrl: (obj.hosted_invoice_url as string) || null,
            pdfUrl: (obj.invoice_pdf as string) || null,
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const custId = obj.customer as string;
      await db.tenantSubscription.updateMany({
        where: { providerCustomerId: custId },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }

  await db.billingEvent.update({
    where: { id: billingEvent.id },
    data: { processed: true, processedAt: new Date() },
  });

  return { processed: true, eventType: event.type };
}

function mapStripeStatus(stripeStatus: string): "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED" | "EXPIRED" {
  switch (stripeStatus) {
    case "trialing": return "TRIAL";
    case "active": return "ACTIVE";
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELLED";
    case "unpaid": return "PAST_DUE";
    case "paused": return "PAUSED";
    default: return "EXPIRED";
  }
}
