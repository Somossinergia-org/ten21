import { db } from "@/lib/db";

/**
 * Get daily counts for the last 7 days for sparkline charts.
 */

export async function getIncidentsByDay(tenantId: string) {
  const days = last7Days();
  const counts = await Promise.all(
    days.map(async (d) => ({
      day: d.label,
      value: await db.incident.count({
        where: { tenantId, createdAt: { gte: d.start, lt: d.end } },
      }),
    })),
  );
  return counts;
}

export async function getReceptionsByDay(tenantId: string) {
  const days = last7Days();
  const counts = await Promise.all(
    days.map(async (d) => ({
      day: d.label,
      value: await db.reception.count({
        where: { tenantId, createdAt: { gte: d.start, lt: d.end } },
      }),
    })),
  );
  return counts;
}

export async function getDeliveriesByDay(tenantId: string) {
  const days = last7Days();
  const counts = await Promise.all(
    days.map(async (d) => ({
      day: d.label,
      value: await db.delivery.count({
        where: { tenantId, createdAt: { gte: d.start, lt: d.end } },
      }),
    })),
  );
  return counts;
}

function last7Days() {
  const result = [];
  const dayNames = ["D", "L", "M", "X", "J", "V", "S"];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    result.push({ start, end, label: dayNames[start.getDay()] });
  }
  return result;
}
