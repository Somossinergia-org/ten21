import { db } from "@/lib/db";
import type { CreateReceptionInput, ReceptionLineInput } from "@/lib/validations/reception";
import type { IncidentType } from "@prisma/client";

// ============================================================
// RECEPTION NUMBER GENERATION
// ============================================================

async function generateReceptionNumber(tenantId: string): Promise<string> {
  const last = await db.reception.findFirst({
    where: { tenantId },
    orderBy: { receptionNumber: "desc" },
    select: { receptionNumber: true },
  });

  if (!last) return "REC-001";

  const lastNum = parseInt(last.receptionNumber.replace("REC-", ""), 10);
  return `REC-${(lastNum + 1).toString().padStart(3, "0")}`;
}

// ============================================================
// QUERIES
// ============================================================

export async function listReceptions(tenantId: string) {
  return db.reception.findMany({
    where: { tenantId },
    include: {
      purchaseOrder: {
        select: { orderNumber: true, supplier: { select: { name: true } } },
      },
      receivedBy: { select: { name: true } },
      _count: { select: { incidents: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReception(id: string, tenantId: string) {
  return db.reception.findFirst({
    where: { id, tenantId },
    include: {
      purchaseOrder: {
        select: {
          orderNumber: true,
          supplier: { select: { name: true, code: true } },
        },
      },
      receivedBy: { select: { name: true } },
      lines: {
        include: {
          purchaseOrderLine: {
            include: { product: { select: { ref: true, name: true } } },
          },
        },
      },
      incidents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/** Get purchase orders eligible for reception (SENT or PARTIAL) */
export async function getEligibleOrders(tenantId: string) {
  return db.purchaseOrder.findMany({
    where: {
      tenantId,
      status: { in: ["SENT", "PARTIAL"] },
    },
    include: {
      supplier: { select: { name: true } },
      lines: {
        include: { product: { select: { ref: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// CORE: CREATE RECEPTION WITH AUTO-COMPARISON
// ============================================================

type IncidentToCreate = {
  type: IncidentType;
  description: string;
};

/**
 * Compare a single reception line against its expected values.
 * Returns a list of incidents to create (0, 1, or 2).
 */
export function compareLineForIncidents(
  line: ReceptionLineInput,
  productRef: string,
  productName: string,
): IncidentToCreate[] {
  const incidents: IncidentToCreate[] = [];

  // Check quantity mismatch
  const diff = line.quantityReceived - line.quantityExpected;
  if (diff !== 0) {
    const direction = diff < 0 ? "faltan" : "sobran";
    incidents.push({
      type: "QUANTITY_MISMATCH",
      description:
        `${productRef} (${productName}): se esperaban ${line.quantityExpected}, ` +
        `se recibieron ${line.quantityReceived} (${direction} ${Math.abs(diff)})`,
    });
  }

  // Check damaged items
  if (line.quantityDamaged > 0) {
    incidents.push({
      type: "DAMAGED",
      description:
        `${productRef} (${productName}): ${line.quantityDamaged} unidad(es) dañada(s)`,
    });
  }

  return incidents;
}

/**
 * Main function: create a reception, compare lines, auto-create incidents,
 * and update the purchase order status.
 *
 * All operations run in a single transaction.
 */
export async function createReception(
  data: CreateReceptionInput,
  tenantId: string,
  receivedById: string,
) {
  return db.$transaction(async (tx) => {
    // 1. Verify purchase order belongs to tenant and is eligible
    const purchaseOrder = await tx.purchaseOrder.findFirst({
      where: {
        id: data.purchaseOrderId,
        tenantId,
        status: { in: ["SENT", "PARTIAL"] },
      },
      include: {
        lines: {
          include: { product: { select: { ref: true, name: true } } },
        },
      },
    });

    if (!purchaseOrder) {
      throw new Error("Pedido no encontrado o no elegible para recepcion");
    }

    // 2. Generate reception number
    const receptionNumber = await generateReceptionNumber(tenantId);

    // 3. Build a lookup of PO lines for comparison
    const poLineMap = new Map(
      purchaseOrder.lines.map((l) => [l.id, l]),
    );

    // 4. Collect all incidents to create
    const allIncidents: IncidentToCreate[] = [];

    for (const line of data.lines) {
      const poLine = poLineMap.get(line.purchaseOrderLineId);
      if (!poLine) continue;

      const lineIncidents = compareLineForIncidents(
        line,
        poLine.product.ref,
        poLine.product.name,
      );
      allIncidents.push(...lineIncidents);
    }

    // 5. Determine reception status
    const receptionStatus = allIncidents.length > 0 ? "WITH_INCIDENTS" : "COMPLETED";

    // 6. Create the reception with lines
    const reception = await tx.reception.create({
      data: {
        receptionNumber,
        purchaseOrderId: data.purchaseOrderId,
        deliveryNoteRef: data.deliveryNoteRef || null,
        notes: data.notes || null,
        status: receptionStatus,
        receivedById,
        tenantId,
        lines: {
          create: data.lines.map((line) => ({
            purchaseOrderLineId: line.purchaseOrderLineId,
            quantityExpected: line.quantityExpected,
            quantityReceived: line.quantityReceived,
            quantityDamaged: line.quantityDamaged,
            notes: line.notes || null,
          })),
        },
      },
    });

    // 7. Create incidents
    if (allIncidents.length > 0) {
      await tx.incident.createMany({
        data: allIncidents.map((inc) => ({
          receptionId: reception.id,
          type: inc.type,
          status: "REGISTERED",
          description: inc.description,
          reportedById: receivedById,
          tenantId,
        })),
      });
    }

    // 8. Update PurchaseOrderLine.quantityReceived for each line
    for (const line of data.lines) {
      await tx.purchaseOrderLine.update({
        where: { id: line.purchaseOrderLineId },
        data: {
          quantityReceived: { increment: line.quantityReceived },
        },
      });
    }

    // 9. Re-read PO lines to determine new PO status
    const updatedPoLines = await tx.purchaseOrderLine.findMany({
      where: { purchaseOrderId: data.purchaseOrderId },
    });

    const allFullyReceived = updatedPoLines.every(
      (l) => l.quantityReceived >= l.quantityOrdered,
    );
    const someReceived = updatedPoLines.some((l) => l.quantityReceived > 0);

    let newPoStatus: "SENT" | "PARTIAL" | "RECEIVED";
    if (allFullyReceived) {
      newPoStatus = "RECEIVED";
    } else if (someReceived) {
      newPoStatus = "PARTIAL";
    } else {
      newPoStatus = "SENT";
    }

    await tx.purchaseOrder.update({
      where: { id: data.purchaseOrderId },
      data: { status: newPoStatus },
    });

    return {
      reception,
      incidentsCreated: allIncidents.length,
      newPoStatus,
    };
  });
}
