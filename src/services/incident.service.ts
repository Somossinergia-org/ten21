import { db } from "@/lib/db";

export async function listIncidents(tenantId: string) {
  return db.incident.findMany({
    where: { tenantId },
    include: {
      reception: {
        select: {
          receptionNumber: true,
          purchaseOrder: {
            select: { orderNumber: true },
          },
        },
      },
      reportedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIncident(id: string, tenantId: string) {
  return db.incident.findFirst({
    where: { id, tenantId },
    include: {
      reception: {
        select: {
          receptionNumber: true,
          purchaseOrder: {
            select: {
              orderNumber: true,
              supplier: { select: { name: true } },
            },
          },
        },
      },
      reportedBy: { select: { name: true } },
    },
  });
}
