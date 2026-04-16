import { db } from "@/lib/db";

// ============================================================
// KPIs
// ============================================================

export async function getKpis(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    openIncidents,
    pendingOrders,
    todayReceptionsOk,
    vehiclesInUse,
    activeDeliveries,
  ] = await Promise.all([
    db.incident.count({
      where: { tenantId, status: { in: ["REGISTERED", "NOTIFIED", "REVIEWED"] } },
    }),
    db.purchaseOrder.count({
      where: { tenantId, status: { in: ["SENT", "PARTIAL"] } },
    }),
    db.reception.count({
      where: { tenantId, status: "COMPLETED", receivedAt: { gte: today } },
    }),
    db.vehicle.count({
      where: { tenantId, status: "IN_USE" },
    }),
    db.delivery.count({
      where: { tenantId, status: { in: ["ASSIGNED", "IN_TRANSIT"] } },
    }),
  ]);

  const [
    pendingSales,
    partiallyReservedSales,
    openPostSaleTickets,
    lowStockProducts,
  ] = await Promise.all([
    db.salesOrder.count({
      where: { tenantId, status: { in: ["CONFIRMED", "RESERVED", "PARTIALLY_RESERVED"] } },
    }),
    db.salesOrder.count({
      where: { tenantId, status: "PARTIALLY_RESERVED" },
    }),
    db.postSaleTicket.count({
      where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS", "WAITING_SUPPLIER"] } },
    }),
    db.productInventory.count({
      where: { tenantId, available: { lte: 0 } },
    }),
  ]);

  return {
    openIncidents,
    pendingOrders,
    todayReceptionsOk,
    vehiclesInUse,
    activeDeliveries,
    pendingSales,
    partiallyReservedSales,
    openPostSaleTickets,
    lowStockProducts,
  };
}

// ============================================================
// ALERTS (critical block)
// ============================================================

export async function getAlerts(tenantId: string) {
  const [openIncidents, failedDeliveries, incompleteOrders] = await Promise.all([
    db.incident.findMany({
      where: { tenantId, status: { in: ["REGISTERED", "NOTIFIED"] } },
      include: {
        reception: {
          select: {
            receptionNumber: true,
            purchaseOrder: { select: { orderNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.delivery.findMany({
      where: { tenantId, status: "FAILED" },
      include: {
        vehicle: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.purchaseOrder.findMany({
      where: { tenantId, status: "PARTIAL" },
      include: { supplier: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return { openIncidents, failedDeliveries, incompleteOrders };
}

// ============================================================
// TODAY'S OPERATIONS
// ============================================================

export async function getTodayOps(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayReceptions, todayDeliveries] = await Promise.all([
    db.reception.findMany({
      where: { tenantId, receivedAt: { gte: today } },
      include: {
        purchaseOrder: {
          select: { orderNumber: true, supplier: { select: { name: true } } },
        },
        receivedBy: { select: { name: true } },
      },
      orderBy: { receivedAt: "desc" },
      take: 10,
    }),
    db.delivery.findMany({
      where: {
        tenantId,
        OR: [
          { scheduledDate: { gte: today } },
          { status: { in: ["ASSIGNED", "IN_TRANSIT"] } },
          { deliveredAt: { gte: today } },
        ],
      },
      include: {
        vehicle: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return { todayReceptions, todayDeliveries };
}

// ============================================================
// RECENT ACTIVITY
// ============================================================

export async function getRecent(tenantId: string) {
  const [recentIncidents, recentOrders, recentReceptions] = await Promise.all([
    db.incident.findMany({
      where: { tenantId },
      include: {
        reception: { select: { receptionNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.purchaseOrder.findMany({
      where: { tenantId },
      include: { supplier: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.reception.findMany({
      where: { tenantId },
      include: {
        purchaseOrder: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { recentIncidents, recentOrders, recentReceptions };
}
