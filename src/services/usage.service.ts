import { db } from "@/lib/db";

function currentPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function snapshotUsage(tenantId: string) {
  const periodKey = currentPeriodKey();

  const [users, customers, products, monthlySales, activeAutomations] = await Promise.all([
    db.user.count({ where: { tenantId, active: true } }),
    db.customer.count({ where: { tenantId, active: true } }),
    db.product.count({ where: { tenantId, active: true } }),
    db.salesOrder.count({
      where: {
        tenantId,
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    db.automationRule.count({ where: { tenantId, enabled: true } }),
  ]);

  const metrics = [
    { code: "users_active", value: users },
    { code: "customers", value: customers },
    { code: "products", value: products },
    { code: "monthly_sales", value: monthlySales },
    { code: "active_automations", value: activeAutomations },
  ];

  for (const m of metrics) {
    await db.usageMetric.upsert({
      where: { tenantId_metricCode_periodKey: { tenantId, metricCode: m.code, periodKey } },
      create: { tenantId, metricCode: m.code, metricValue: m.value, periodKey },
      update: { metricValue: m.value, snapshotDate: new Date() },
    });
  }

  return metrics;
}

export async function getCurrentUsage(tenantId: string) {
  const periodKey = currentPeriodKey();
  const metrics = await db.usageMetric.findMany({
    where: { tenantId, periodKey },
  });
  return metrics.reduce((acc, m) => {
    acc[m.metricCode] = m.metricValue;
    return acc;
  }, {} as Record<string, number>);
}

export async function checkLimitWarnings(tenantId: string) {
  const [usage, sub] = await Promise.all([
    getCurrentUsage(tenantId),
    db.tenantSubscription.findUnique({
      where: { tenantId }, include: { plan: true },
    }),
  ]);

  if (!sub?.plan?.limitsJson) return [];
  const limits = sub.plan.limitsJson as Record<string, number>;

  const warnings: { metric: string; current: number; limit: number; percent: number }[] = [];

  for (const [metric, limit] of Object.entries(limits)) {
    const current = usage[metric] || 0;
    const percent = (current / limit) * 100;
    if (percent >= 80) {
      warnings.push({ metric, current, limit, percent });
    }
  }

  return warnings;
}
