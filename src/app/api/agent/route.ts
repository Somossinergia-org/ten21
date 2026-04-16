import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat, generateBriefing, detectAnomalies } from "@/lib/gemini";

async function getBusinessContext(tenantId: string) {
  const [incidents, orders, receptions, deliveries, vehicles] = await Promise.all([
    db.incident.findMany({ where: { tenantId }, select: { type: true, status: true, description: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.purchaseOrder.findMany({ where: { tenantId }, select: { orderNumber: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.reception.findMany({ where: { tenantId }, select: { receptionNumber: true, status: true, receivedAt: true }, orderBy: { receivedAt: "desc" }, take: 10 }),
    db.delivery.findMany({ where: { tenantId }, select: { deliveryNumber: true, status: true, customerName: true, scheduledDate: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.vehicle.findMany({ where: { tenantId }, select: { name: true, plate: true, status: true } }),
  ]);

  const openIncidents = incidents.filter((i) => i.status !== "CLOSED");
  const pendingOrders = orders.filter((o) => o.status === "SENT" || o.status === "PARTIAL");

  return `
INCIDENCIAS ABIERTAS (${openIncidents.length}):
${openIncidents.map((i) => `- ${i.type}: ${i.description} (${i.status})`).join("\n") || "Ninguna"}

PEDIDOS PENDIENTES (${pendingOrders.length}):
${pendingOrders.map((o) => `- ${o.orderNumber}: ${o.status}`).join("\n") || "Ninguno"}

RECEPCIONES RECIENTES:
${receptions.slice(0, 5).map((r) => `- ${r.receptionNumber}: ${r.status}`).join("\n") || "Ninguna"}

ENTREGAS:
${deliveries.slice(0, 5).map((d) => `- ${d.deliveryNumber}: ${d.customerName} (${d.status})`).join("\n") || "Ninguna"}

VEHICULOS:
${vehicles.map((v) => `- ${v.name} (${v.plate}): ${v.status}`).join("\n") || "Ninguno"}

RESUMEN:
- Incidencias abiertas: ${openIncidents.length}
- Pedidos pendientes: ${pendingOrders.length}
- Total recepciones: ${receptions.length}
- Total entregas: ${deliveries.length}
- Vehiculos: ${vehicles.length}
`.trim();
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { action, message } = body;

  const context = await getBusinessContext(session.user.tenantId);

  if (action === "chat") {
    const response = await chat(message || "¿Cómo está el negocio?", context);
    return NextResponse.json({ response });
  }

  if (action === "briefing") {
    const response = await generateBriefing(context);
    return NextResponse.json({ response });
  }

  if (action === "anomalies") {
    const alerts = await detectAnomalies(context);
    return NextResponse.json({ alerts });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
