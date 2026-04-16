import { db } from "@/lib/db";
import type { HealthSeverity, HealthCategory } from "@prisma/client";

export async function recordEvent(data: {
  tenantId?: string;
  severity: HealthSeverity;
  category: HealthCategory;
  code: string;
  message: string;
  payload?: object;
}) {
  try {
    return await db.systemHealthEvent.create({
      data: {
        tenantId: data.tenantId || null,
        severity: data.severity,
        category: data.category,
        code: data.code,
        message: data.message,
        payloadJson: data.payload ? data.payload as object : undefined,
      },
    });
  } catch (e) {
    console.error("[health] Failed to record event:", e);
    return null;
  }
}

export async function listEvents(filters?: {
  tenantId?: string;
  severity?: string;
  category?: string;
  resolved?: boolean;
  limit?: number;
}) {
  return db.systemHealthEvent.findMany({
    where: {
      ...(filters?.tenantId && { tenantId: filters.tenantId }),
      ...(filters?.severity && { severity: filters.severity as HealthSeverity }),
      ...(filters?.category && { category: filters.category as HealthCategory }),
      ...(filters?.resolved !== undefined && { resolved: filters.resolved }),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit || 100,
  });
}

export async function resolveEvent(id: string) {
  return db.systemHealthEvent.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });
}

export async function getSummary() {
  const [critical, errors, warnings, unresolved] = await Promise.all([
    db.systemHealthEvent.count({ where: { severity: "CRITICAL", resolved: false } }),
    db.systemHealthEvent.count({ where: { severity: "ERROR", resolved: false } }),
    db.systemHealthEvent.count({ where: { severity: "WARNING", resolved: false } }),
    db.systemHealthEvent.count({ where: { resolved: false } }),
  ]);
  return { critical, errors, warnings, unresolved };
}
