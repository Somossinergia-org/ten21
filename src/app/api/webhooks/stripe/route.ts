import { NextResponse } from "next/server";
import { verifyWebhookSignature, handleWebhookEvent, isStripeConfigured } from "@/lib/billing/stripe-provider";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    const result = await handleWebhookEvent(event);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[stripe-webhook] Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook processing failed" },
      { status: 500 },
    );
  }
}
