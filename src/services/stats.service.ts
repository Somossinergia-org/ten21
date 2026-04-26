import { db } from "@/lib/db";

export async function getSupplierStats(tenantId: string) {
  const suppliers = await db.supplier.findMany({
    where: { tenantId, active: true },
    include: {
      orders: {
        include: {
          receptions: {
            include: {
              _count: { select: { incidents: true } },
            },
          },
          _count: { select: { lines: true } },
        },
      },
    },
  });

  return suppliers.map((s) => {
    const totalOrders = s.orders.length;
    const totalReceptions = s.orders.reduce((sum, o) => sum + o.receptions.length, 0);
    const receptionsWithIncidents = s.orders.reduce(
      (sum, o) => sum + o.receptions.filter((r) => r._count.incidents > 0).length,
      0,
    );
    const totalIncidents = s.orders.reduce(
      (sum, o) => sum + o.receptions.reduce((s2, r) => s2 + r._count.incidents, 0),
      0,
    );
    const reliability = totalReceptions > 0
      ? Math.round(((totalReceptions - receptionsWithIncidents) / totalReceptions) * 100)
      : 100;

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      totalOrders,
      totalReceptions,
      totalIncidents,
      reliability,
    };
  });
}
