import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const [incidents, orders, receptions, deliveries, suppliers, vehicles] = await Promise.all([
    db.incident.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.purchaseOrder.findMany({ where: { tenantId }, include: { supplier: { select: { name: true } }, _count: { select: { lines: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.reception.findMany({ where: { tenantId }, include: { _count: { select: { incidents: true } } }, orderBy: { receivedAt: "desc" }, take: 20 }),
    db.delivery.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.supplier.findMany({ where: { tenantId, active: true } }),
    db.vehicle.findMany({ where: { tenantId } }),
  ]);

  const context = `
INFORME COMPLETO DE LA TIENDA DE ELECTRODOMESTICOS:

INCIDENCIAS (${incidents.length} totales):
- Abiertas: ${incidents.filter((i) => i.status !== "CLOSED").length}
- Cerradas: ${incidents.filter((i) => i.status === "CLOSED").length}
- Tipos: ${JSON.stringify(incidents.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {} as Record<string, number>))}

PEDIDOS (${orders.length}):
- Por estado: DRAFT=${orders.filter((o) => o.status === "DRAFT").length}, SENT=${orders.filter((o) => o.status === "SENT").length}, PARTIAL=${orders.filter((o) => o.status === "PARTIAL").length}, RECEIVED=${orders.filter((o) => o.status === "RECEIVED").length}
- Proveedores activos: ${suppliers.map((s) => s.name).join(", ")}

RECEPCIONES (${receptions.length}):
- Completadas OK: ${receptions.filter((r) => r.status === "COMPLETED").length}
- Con incidencias: ${receptions.filter((r) => r.status === "WITH_INCIDENTS").length}

ENTREGAS (${deliveries.length}):
- Entregadas: ${deliveries.filter((d) => d.status === "DELIVERED").length}
- En ruta: ${deliveries.filter((d) => d.status === "IN_TRANSIT").length}
- Fallidas: ${deliveries.filter((d) => d.status === "FAILED").length}
- Pendientes: ${deliveries.filter((d) => d.status === "PENDING" || d.status === "ASSIGNED").length}

VEHICULOS (${vehicles.length}):
- Disponibles: ${vehicles.filter((v) => v.status === "AVAILABLE").length}
- En uso: ${vehicles.filter((v) => v.status === "IN_USE").length}

PROVEEDORES: ${suppliers.length} activos
  `.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `Eres el analista de negocio de una tienda de electrodomésticos. Genera un INFORME DIARIO COMPLETO en español con estas secciones:

1. RESUMEN EJECUTIVO (2-3 frases del estado general)
2. ALERTAS Y PROBLEMAS (lista de lo que requiere atención inmediata)
3. OPERACIONES DEL DIA (qué hay pendiente hoy)
4. ANALISIS DE PROVEEDORES (quién da problemas, quién funciona bien)
5. RECOMENDACIONES (3-5 acciones concretas que el jefe debería hacer hoy)
6. PUNTUACION GENERAL (de 1 a 10, con justificación)

Sé directo, concreto y útil. Sin relleno.

DATOS:
${context}` }],
      }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.5 },
    });

    return NextResponse.json({ report: result.response.text() });
  } catch (e) {
    console.error("[report] error:", e);
    return NextResponse.json({ error: "Error al generar el informe" }, { status: 500 });
  }
}
