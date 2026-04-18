import { db } from "@/lib/db";
import type { IncidentStatus } from "@prisma/client";

// ============================================================
// VALID STATE TRANSITIONS
// ============================================================

const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  REGISTERED: ["NOTIFIED"],
  NOTIFIED: ["REVIEWED"],
  REVIEWED: ["CLOSED"],
  CLOSED: [],
};

export function getNextStatuses(current: IncidentStatus): IncidentStatus[] {
  return validTransitions[current] || [];
}

export function isValidTransition(
  from: IncidentStatus,
  to: IncidentStatus,
): boolean {
  return (validTransitions[from] || []).includes(to);
}

// ============================================================
// QUERIES
// ============================================================

export async function listIncidents(
  tenantId: string,
  statusFilter?: IncidentStatus,
) {
  return db.incident.findMany({
    where: {
      tenantId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
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
          id: true,
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
      closedBy: { select: { name: true } },
    },
  });
}

// ============================================================
// STATE TRANSITIONS
// ============================================================

export async function transitionIncident(
  id: string,
  tenantId: string,
  newStatus: IncidentStatus,
  userId: string,
  resolution?: string,
) {
  const incident = await db.incident.findFirst({
    where: { id, tenantId },
  });

  if (!incident) {
    throw new Error("Incidencia no encontrada");
  }

  if (!isValidTransition(incident.status, newStatus)) {
    throw new Error(
      `No se puede cambiar de ${incident.status} a ${newStatus}`,
    );
  }

  if (newStatus === "CLOSED" && !resolution?.trim()) {
    throw new Error("Se requiere una resolucion para cerrar la incidencia");
  }

  // Build update data based on the target status
  const now = new Date();
  const updateData: Record<string, unknown> = { status: newStatus };

  if (newStatus === "REVIEWED") {
    updateData.reviewedAt = now;
  }

  if (newStatus === "CLOSED") {
    updateData.closedAt = now;
    updateData.closedById = userId;
    updateData.resolution = resolution;
  }

  return db.incident.update({
    where: { id },
    data: updateData,
  });
}
