import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as outboundService from "@/services/outbound.service";

/**
 * Cron endpoint: processes outbound queue for all active tenants.
 * Protected by CRON_SECRET header (Vercel Cron adds `Authorization: Bearer <secret>`).
 *
 * To wire on Vercel: add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/process-outbound", "schedule": "* /5 * * * *" }] }
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await db.tenant.findMany({
    where: { active: true, suspendedAt: null },
    select: { id: true, slug: true },
  });

  const results: Array<{ tenantId: string; slug: string; processed: number; errors: number }> = [];

  for (const tenant of tenants) {
    try {
      const res = await outboundService.processQueue(tenant.id);
      const errors = res.filter((r) => r.status === "FAILED" || r.status === "RETRY").length;
      results.push({
        tenantId: tenant.id,
        slug: tenant.slug,
        processed: res.length,
        errors,
      });
    } catch (e) {
      results.push({
        tenantId: tenant.id,
        slug: tenant.slug,
        processed: 0,
        errors: -1,
      });
      console.error(`[cron/outbound] tenant ${tenant.slug} failed:`, e);
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    tenantsProcessed: tenants.length,
    results,
  });
}

export const POST = GET;
