import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, email, userName, password } = body;

    if (!name || !slug || !email || !userName || !password) {
      return NextResponse.json({ error: "Campos obligatorios: name, slug, email, userName, password" }, { status: 400 });
    }

    const existing = await db.tenant.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un tenant con ese slug" }, { status: 409 });
    }

    const tenant = await db.$transaction(async (tx) => {
      const t = await tx.tenant.create({
        data: { name, slug },
      });

      await tx.user.create({
        data: {
          email,
          name: userName,
          password: await bcrypt.hash(password, 10),
          role: "JEFE",
          tenantId: t.id,
        },
      });

      await tx.tenantConfig.create({
        data: {
          tenantId: t.id,
          businessName: name,
        },
      });

      await tx.tenantOnboarding.create({
        data: {
          tenantId: t.id,
          status: "READY",
          currentStep: 5,
        },
      });

      // Assign starter plan if exists
      const plan = await tx.subscriptionPlan.findFirst({
        where: { code: "starter", active: true },
      });
      if (plan) {
        const trialEnd = new Date(Date.now() + 30 * 86400000);
        await tx.tenantSubscription.create({
          data: {
            tenantId: t.id,
            planId: plan.id,
            status: "TRIAL",
            trialStartsAt: new Date(),
            trialEndsAt: trialEnd,
          },
        });
        await tx.tenant.update({
          where: { id: t.id },
          data: { planCode: "starter", trialEndsAt: trialEnd },
        });
      }

      return t;
    });

    return NextResponse.json({ status: "created", tenantId: tenant.id, name: tenant.name, slug: tenant.slug });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
