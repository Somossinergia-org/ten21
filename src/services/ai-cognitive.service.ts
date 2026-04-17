import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPersonality } from "@/lib/ai/personalities/registry";
import { getTerms } from "@/lib/ai/glossary/registry";
import { getRelations } from "@/lib/ai/ontology/registry";
import { getDocumentProfile } from "@/lib/ai/document-reading/registry";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askAgentCognitive(
  tenantId: string,
  agentCode: string,
  question: string,
  context: string,
) {
  const personality = getPersonality(agentCode);
  if (!personality) throw new Error("Personalidad no encontrada");

  const domainGlossary = getTerms(personality.agentCode === "executive" ? "finanzas" : personality.agentCode);
  const glossaryBlock = domainGlossary.length > 0
    ? `\n\nTERMINOS DE NEGOCIO:\n${domainGlossary.slice(0, 8).map((t) => `- ${t.term}: ${t.shortDefinition}`).join("\n")}`
    : "";

  const prompt = `${personality.systemPrompt}

PERSONALIDAD ACTIVADA:
- Rol: ${personality.roleSimulated}
- Tono: ${personality.tone}
- Vocabulario preferido: ${personality.vocabulary.join(", ")}
- Estilo: ${personality.outputStyle}
${glossaryBlock}

CONTEXTO DEL SISTEMA (datos reales):
${context}

PREGUNTA DEL USUARIO:
${question}

RESPUESTA (respeta tono, formato y reglas):`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
    });
    return result.response.text();
  } catch (e) {
    console.error(`[ai-cognitive] ${agentCode} error:`, e);
    return "No he podido procesar la consulta con contexto completo.";
  }
}

export async function readDocument(
  agentCode: string,
  documentType: string,
  documentData: object,
) {
  const profile = getDocumentProfile(agentCode, documentType);
  if (!profile) {
    return { error: `Agente ${agentCode} no sabe leer ${documentType}`, confidence: "ninguna" };
  }

  const personality = getPersonality(agentCode);
  const prompt = `${personality?.systemPrompt || ""}

Vas a LEER un documento de tipo ${documentType} como experto en tu dominio.

CAMPOS ESPERADOS:
${profile.fieldsExpected.join(", ")}

REGLAS DE AMBIGUEDAD:
${profile.ambiguityRules.join("\n")}

REGLAS DE INCONSISTENCIA:
${profile.inconsistencyRules.join("\n")}

DOCUMENTO:
${JSON.stringify(documentData, null, 2)}

Devuelve SOLO un JSON con este formato:
{
  "resumen": "...",
  "camposDetectados": {...},
  "huecos": ["..."],
  "inconsistencias": ["..."],
  "impacto": "...",
  "accionSugerida": "...",
  "confianza": "alta|media|baja"
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
    });
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return { error: "Parse error", raw: text, confidence: "baja" }; }
    }
    return { resumen: text, confianza: "baja" };
  } catch (e) {
    console.error(`[ai-cognitive] readDocument error:`, e);
    return { error: "Error al leer documento", confianza: "ninguna" };
  }
}

export async function buildContextPack(tenantId: string, agentCode: string) {
  // Build a compact summary snapshot relevant to the agent's domain
  const now = new Date();
  const cached = await db.aiContextPack.findFirst({
    where: { tenantId, agentId: agentCode, packType: "default", expiresAt: { gt: now } },
    orderBy: { generatedAt: "desc" },
  });
  if (cached) return cached.summaryJson;

  let summary: Record<string, unknown> = { tenantId, agentCode, generatedAt: now.toISOString() };

  if (agentCode === "sales") {
    const [total, pending, cancelled] = await Promise.all([
      db.salesOrder.count({ where: { tenantId } }),
      db.salesOrder.count({ where: { tenantId, status: { in: ["CONFIRMED", "RESERVED", "PARTIALLY_RESERVED"] } } }),
      db.salesOrder.count({ where: { tenantId, status: "CANCELLED" } }),
    ]);
    summary = { ...summary, totalVentas: total, pendientesServir: pending, canceladas: cancelled };
  } else if (agentCode === "purchases") {
    const [total, partial, sent] = await Promise.all([
      db.purchaseOrder.count({ where: { tenantId } }),
      db.purchaseOrder.count({ where: { tenantId, status: "PARTIAL" } }),
      db.purchaseOrder.count({ where: { tenantId, status: "SENT" } }),
    ]);
    summary = { ...summary, totalPedidos: total, pedidosParciales: partial, pedidosEnviados: sent };
  } else if (agentCode === "warehouse") {
    const [receptions, incidents] = await Promise.all([
      db.reception.count({ where: { tenantId, status: { in: ["PENDING", "CHECKING"] } } }),
      db.incident.count({ where: { tenantId, status: { in: ["REGISTERED", "NOTIFIED"] } } }),
    ]);
    summary = { ...summary, recepcionesPendientes: receptions, incidenciasAbiertas: incidents };
  } else if (agentCode === "inventory") {
    const lowStock = await db.productInventory.count({ where: { tenantId, available: { lte: 0 } } });
    summary = { ...summary, productosSinStock: lowStock };
  } else if (agentCode === "deliveries") {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [active, failed] = await Promise.all([
      db.delivery.count({ where: { tenantId, status: { in: ["ASSIGNED", "IN_TRANSIT"] } } }),
      db.delivery.count({ where: { tenantId, status: "FAILED", deliveredAt: { gte: today } } }),
    ]);
    summary = { ...summary, entregasActivas: active, fallidasHoy: failed };
  } else if (agentCode === "treasury") {
    const [overdue, upcoming] = await Promise.all([
      db.treasuryEntry.count({ where: { tenantId, status: "OVERDUE" } }),
      db.treasuryEntry.count({ where: { tenantId, status: "UPCOMING", dueDate: { lte: new Date(now.getTime() + 7 * 86400000) } } }),
    ]);
    summary = { ...summary, vencidos: overdue, proximos7d: upcoming };
  } else if (agentCode === "postsales") {
    const [open, urgent] = await Promise.all([
      db.postSaleTicket.count({ where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.postSaleTicket.count({ where: { tenantId, priority: { in: ["HIGH", "URGENT"] }, status: { not: "CLOSED" } } }),
    ]);
    summary = { ...summary, ticketsAbiertos: open, ticketsUrgentes: urgent };
  }

  await db.aiContextPack.create({
    data: {
      tenantId, agentId: agentCode, packType: "default",
      summaryJson: summary as object,
      expiresAt: new Date(now.getTime() + 5 * 60000),
    },
  });

  return summary;
}

export async function recordFeedback(tenantId: string, agentCode: string, userId: string, data: {
  signalType: "USEFUL" | "NOT_USEFUL" | "INCORRECT" | "TOO_GENERIC" | "TOO_TECHNICAL" | "MISSED_RISK";
  conversationId?: string;
  messageId?: string;
  notes?: string;
}) {
  return db.aiFeedbackSignal.create({
    data: {
      tenantId,
      agentId: agentCode,
      userId,
      signalType: data.signalType,
      conversationId: data.conversationId || null,
      messageId: data.messageId || null,
      notes: data.notes || null,
    },
  });
}

export async function remember(tenantId: string, agentCode: string, data: {
  entityType: string;
  entityId: string;
  memoryType: "SUMMARY" | "RISK" | "PREFERENCE" | "PATTERN";
  content: string;
  confidenceScore?: number;
}) {
  return db.aiEntityMemory.create({
    data: {
      tenantId, agentId: agentCode,
      entityType: data.entityType,
      entityId: data.entityId,
      memoryType: data.memoryType,
      content: data.content,
      confidenceScore: data.confidenceScore,
    },
  });
}

export async function recallMemory(tenantId: string, agentCode: string, entityType: string, entityId: string) {
  return db.aiEntityMemory.findMany({
    where: { tenantId, agentId: agentCode, entityType, entityId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
}
