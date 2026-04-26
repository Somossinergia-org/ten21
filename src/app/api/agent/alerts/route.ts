import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectAnomalies } from "@/lib/gemini";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tenantId = session.user.tenantId;

  // Gather stats for anomaly detection
  const [incidents, orders, receptions, deliveries] = await Promise.all([
    db.incident.findMany({ where: { tenantId }, select: { type: true, status: true, description: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.purchaseOrder.findMany({ where: { tenantId }, select: { orderNumber: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.reception.findMany({ where: { tenantId }, select: { receptionNumber: true, status: true, receivedAt: true }, orderBy: { receivedAt: "desc" }, take: 20 }),
    db.delivery.findMany({ where: { tenantId }, select: { deliveryNumber: true, status: true, customerName: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const context = `
DATOS PARA ANALISIS DE ANOMALIAS:

Incidencias (${incidents.length} ultimas):
${incidents.map((i) => `- ${i.type} ${i.status}: ${i.description} (${new Date(i.createdAt).toLocaleDateString("es-ES")})`).join("\n")}

Pedidos (${orders.length} ultimos):
${orders.map((o) => `- ${o.orderNumber}: ${o.status} (${new Date(o.createdAt).toLocaleDateString("es-ES")})`).join("\n")}

Recepciones (${receptions.length} ultimas):
${receptions.map((r) => `- ${r.receptionNumber}: ${r.status} (${new Date(r.receivedAt).toLocaleDateString("es-ES")})`).join("\n")}

Entregas (${deliveries.length} ultimas):
${deliveries.map((d) => `- ${d.deliveryNumber}: ${d.customerName} ${d.status} (${new Date(d.createdAt).toLocaleDateString("es-ES")})`).join("\n")}

Busca patrones como:
- Proveedor con muchas incidencias seguidas
- Pedidos enviados hace mas de 7 dias sin recepcion
- Entregas fallidas recurrentes
- Recepciones con incidencias frecuentes
- Cualquier anomalia o patron preocupante
  `.trim();

  const alerts = await detectAnomalies(context);

  return NextResponse.json({ alerts });
}
