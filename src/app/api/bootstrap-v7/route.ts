import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SETUP_SECRET = process.env.SETUP_SECRET || "ten21-setup-2026";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = [
    {
      code: "starter", name: "Starter",
      description: "Para tiendas pequenas",
      billingCycle: "MONTHLY" as const, priceCents: 4900, currency: "EUR",
      featuresJson: { ai: false, automations: false, finance: true },
      limitsJson: { users_active: 3, customers: 100, products: 200, monthly_sales: 50, active_automations: 0 },
    },
    {
      code: "growth", name: "Growth",
      description: "Tiendas en crecimiento con automatizaciones",
      billingCycle: "MONTHLY" as const, priceCents: 9900, currency: "EUR",
      featuresJson: { ai: true, automations: true, finance: true },
      limitsJson: { users_active: 10, customers: 1000, products: 1000, monthly_sales: 500, active_automations: 10 },
    },
    {
      code: "pro", name: "Pro",
      description: "Cadenas y tiendas grandes",
      billingCycle: "MONTHLY" as const, priceCents: 19900, currency: "EUR",
      featuresJson: { ai: true, automations: true, finance: true, multi_site: false },
      limitsJson: { users_active: 50, customers: 10000, products: 10000, monthly_sales: 5000, active_automations: 100 },
    },
  ];

  const createdPlans = [];
  for (const plan of plans) {
    const created = await db.subscriptionPlan.upsert({
      where: { code: plan.code },
      create: plan,
      update: {},
    });
    createdPlans.push(created);
  }

  // Create subscription for demo tenant
  const tenant = await db.tenant.findFirst();
  if (tenant) {
    const starterPlan = createdPlans.find((p) => p.code === "starter")!;
    await db.tenantSubscription.upsert({
      where: { tenantId: tenant.id },
      create: {
        tenantId: tenant.id,
        planId: starterPlan.id,
        status: "ACTIVE",
        provider: "MANUAL",
      },
      update: {},
    });
    await db.tenant.update({
      where: { id: tenant.id },
      data: { planCode: "starter" },
    });
  }

  return NextResponse.json({ status: "bootstrapped", plans: createdPlans.length });
}
