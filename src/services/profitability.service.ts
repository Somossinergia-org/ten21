import { db } from "@/lib/db";

export async function getSalesProfitability(tenantId: string) {
  const sales = await db.salesOrder.findMany({
    where: { tenantId, status: { not: "CANCELLED" } },
    include: {
      customer: { select: { fullName: true } },
      lines: {
        include: { product: { select: { ref: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return sales.map((sale) => {
    const total = Number(sale.total);
    const estimatedMargin = sale.estimatedMargin ? Number(sale.estimatedMargin) : null;
    const realMargin = sale.realMargin ? Number(sale.realMargin) : null;

    // Calculate if margin data is complete
    const hasAllCosts = sale.lines.every((l) => l.unitExpectedCost !== null);
    const marginStatus = realMargin !== null
      ? "real"
      : hasAllCosts
        ? "estimated"
        : "incomplete";

    return {
      id: sale.id,
      orderNumber: sale.orderNumber,
      customer: sale.customer.fullName,
      status: sale.status,
      total,
      estimatedMargin,
      realMargin,
      marginStatus,
      marginPercent: total > 0 && (realMargin ?? estimatedMargin) !== null
        ? (((realMargin ?? estimatedMargin)! / total) * 100)
        : null,
      lineCount: sale.lines.length,
      createdAt: sale.createdAt,
      deliveredAt: sale.deliveredAt,
    };
  });
}

export async function getMarginAlerts(tenantId: string) {
  const sales = await db.salesOrder.findMany({
    where: {
      tenantId,
      status: { in: ["CONFIRMED", "RESERVED", "PARTIALLY_RESERVED", "IN_DELIVERY", "DELIVERED"] },
    },
    select: {
      id: true, orderNumber: true, total: true,
      estimatedMargin: true, realMargin: true, status: true,
      customer: { select: { fullName: true } },
    },
  });

  const alerts: { type: string; message: string; salesOrderId: string; orderNumber: string }[] = [];

  for (const s of sales) {
    const margin = s.realMargin ? Number(s.realMargin) : s.estimatedMargin ? Number(s.estimatedMargin) : null;
    const total = Number(s.total);

    if (margin !== null && margin < 0) {
      alerts.push({
        type: "NEGATIVE_MARGIN",
        message: `${s.orderNumber} (${s.customer.fullName}): margen negativo ${margin.toFixed(2)}€`,
        salesOrderId: s.id,
        orderNumber: s.orderNumber,
      });
    } else if (margin !== null && total > 0 && (margin / total) < 0.05) {
      alerts.push({
        type: "LOW_MARGIN",
        message: `${s.orderNumber} (${s.customer.fullName}): margen muy bajo ${((margin / total) * 100).toFixed(1)}%`,
        salesOrderId: s.id,
        orderNumber: s.orderNumber,
      });
    }

    if (s.status === "DELIVERED" && !s.realMargin) {
      alerts.push({
        type: "INCOMPLETE_COST",
        message: `${s.orderNumber}: entregada sin coste real confirmado`,
        salesOrderId: s.id,
        orderNumber: s.orderNumber,
      });
    }
  }

  return alerts;
}
