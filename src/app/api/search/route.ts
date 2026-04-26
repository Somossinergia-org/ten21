import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const tenantId = session.user.tenantId;
  const query = `%${q}%`;

  const [orders, incidents, deliveries, products, suppliers, salesOrders, postSaleTickets, customers] = await Promise.all([
    db.purchaseOrder.findMany({
      where: { tenantId, OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { notes: { contains: q, mode: "insensitive" } }] },
      select: { id: true, orderNumber: true, status: true },
      take: 5,
    }),
    db.incident.findMany({
      where: { tenantId, description: { contains: q, mode: "insensitive" } },
      select: { id: true, type: true, description: true, status: true },
      take: 5,
    }),
    db.delivery.findMany({
      where: { tenantId, OR: [{ deliveryNumber: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, deliveryNumber: true, customerName: true, status: true },
      take: 5,
    }),
    db.product.findMany({
      where: { tenantId, OR: [{ ref: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
      select: { id: true, ref: true, name: true },
      take: 5,
    }),
    db.supplier.findMany({
      where: { tenantId, OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    db.salesOrder.findMany({
      where: { tenantId, OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { notes: { contains: q, mode: "insensitive" } }] },
      select: { id: true, orderNumber: true, status: true },
      take: 5,
    }),
    db.postSaleTicket.findMany({
      where: { tenantId, OR: [{ ticketNumber: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      select: { id: true, ticketNumber: true, type: true, status: true },
      take: 5,
    }),
    db.customer.findMany({
      where: { tenantId, OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] },
      select: { id: true, fullName: true, phone: true },
      take: 5,
    }),
  ]);

  const results = [
    ...orders.map((o) => ({ type: "pedido" as const, id: o.id, title: o.orderNumber, sub: o.status, href: `/purchases/${o.id}` })),
    ...incidents.map((i) => ({ type: "incidencia" as const, id: i.id, title: i.type, sub: i.description.substring(0, 60), href: `/incidents/${i.id}` })),
    ...deliveries.map((d) => ({ type: "entrega" as const, id: d.id, title: `${d.deliveryNumber} — ${d.customerName}`, sub: d.status, href: `/vehicles/deliveries/${d.id}` })),
    ...products.map((p) => ({ type: "producto" as const, id: p.id, title: `${p.ref} — ${p.name}`, sub: "", href: `/purchases/products` })),
    ...suppliers.map((s) => ({ type: "proveedor" as const, id: s.id, title: s.name, sub: s.code, href: `/purchases/suppliers` })),
    ...salesOrders.map((s) => ({ type: "venta" as const, id: s.id, title: s.orderNumber, sub: s.status, href: `/sales/${s.id}` })),
    ...postSaleTickets.map((t) => ({ type: "posventa" as const, id: t.id, title: t.ticketNumber, sub: `${t.type} — ${t.status}`, href: `/post-sales/${t.id}` })),
    ...customers.map((c) => ({ type: "cliente" as const, id: c.id, title: c.fullName, sub: c.phone || "", href: `/customers/${c.id}` })),
  ];

  return NextResponse.json(results);
}
