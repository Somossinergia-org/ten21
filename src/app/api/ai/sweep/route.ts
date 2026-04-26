import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAgentsSeeded } from "@/services/ai-agent.service";
import { runInsightSweep } from "@/services/ai-insights.service";

/**
 * Cron endpoint: runs insight sweep for all active tenants.
 * Protected by CRON_SECRET header.
 *
 * To wire on Vercel add to vercel.json:
 *   { "path": "/api/ai/sweep", "schedule": "0,15,30,45 * * * *" }
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

  await ensureAgentsSeeded();

  const tenants = await db.tenant.findMany({
    where: { active: true, suspendedAt: null },
    select: { id: true, slug: true },
  });

  const results: Array<{ tenantId: string; slug: string; processed: number; error?: string }> = [];

  for (const t of tenants) {
    try {
      const res = await runInsightSweep(t.id);
      results.push({ tenantId: t.id, slug: t.slug, processed: res.processed });
    } catch (e) {
      results.push({
        tenantId: t.id,
        slug: t.slug,
        processed: 0,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({ ok: true, tenantsProcessed: results.length, results });
}
