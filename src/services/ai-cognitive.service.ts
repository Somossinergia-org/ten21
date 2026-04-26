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

FORMATO DE SALIDA OBLIGATORIO (V8.2):
Usa estos prefijos exactos al inicio de cada línea relevante. No los traduzcas, no los mezcles:
HECHO: <dato concreto del sistema, con número o estado>
HECHO: <otro dato>
INFERENCIA: <tu lectura o hipótesis apoyada en los hechos>
RECOMENDACION: <acción concreta propuesta>

Reglas:
- Al menos 1 HECHO si hay datos; si no hay datos, escribe "HECHO: No hay datos disponibles".
- Máximo 3 HECHOS, 2 INFERENCIAS y 2 RECOMENDACIONES.
- Nada fuera de estos prefijos salvo una primera línea de resumen (opcional, máximo 1 frase).

RESPUESTA:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
    });
    return result.response.text();
  } catch (e) {
    console.error(`[ai-cognitive] ${agentCode} error:`, e);
    return "HECHO: No he podido procesar la consulta con contexto completo.\nINFERENCIA: Puede ser un problema temporal de servicio.\nRECOMENDACION: Reintenta en unos segundos o revisa conectividad con el servicio de IA.";
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

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7 = new Date(now.getTime() + 7 * 86400000);

  if (agentCode === "executive") {
    // V8: cross-domain summary for executive agent
    const [ventas, entregasActivas, entregasFallidas, ticketsUrgentes, pagosVencidos, cobrosVencidos, lowStock] = await Promise.all([
      db.salesOrder.count({ where: { tenantId, status: { in: ["CONFIRMED", "RESERVED", "PARTIALLY_RESERVED"] } } }),
      db.delivery.count({ where: { tenantId, status: { in: ["ASSIGNED", "IN_TRANSIT"] } } }),
      db.delivery.count({ where: { tenantId, status: "FAILED", deliveredAt: { gte: today } } }),
      db.postSaleTicket.count({ where: { tenantId, priority: { in: ["HIGH", "URGENT"] }, status: { not: "CLOSED" } } }),
      db.treasuryEntry.count({ where: { tenantId, type: { in: ["EXPENSE_EXPECTED"] }, dueDate: { lt: now }, status: { not: "PAID" } } }),
      db.treasuryEntry.count({ where: { tenantId, type: { in: ["INCOME_EXPECTED"] }, dueDate: { lt: now }, status: { not: "PAID" } } }),
      db.productInventory.count({ where: { tenantId, available: { lte: 0 } } }),
    ]);
    summary = { ...summary, ventasPendientesServir: ventas, entregasActivas, entregasFallidasHoy: entregasFallidas, ticketsUrgentes, pagosVencidos, cobrosVencidos, productosSinStock: lowStock };
  } else if (agentCode === "sales") {
    const [total, draft, pending, delivered, margenNegativo] = await Promise.all([
      db.salesOrder.count({ where: { tenantId } }),
      db.salesOrder.count({ where: { tenantId, status: "DRAFT" } }),
      db.salesOrder.count({ where: { tenantId, status: { in: ["CONFIRMED", "RESERVED", "PARTIALLY_RESERVED"] } } }),
      db.salesOrder.count({ where: { tenantId, status: "DELIVERED", deliveredAt: { gte: today } } }),
      db.salesOrder.count({ where: { tenantId, estimatedMargin: { lt: 0 } } }),
    ]);
    summary = { ...summary, totalVentas: total, borradores: draft, pendientesServir: pending, entregadasHoy: delivered, margenNegativo };
  } else if (agentCode === "purchase") {
    const [total, partial, sent, overdueDelivery] = await Promise.all([
      db.purchaseOrder.count({ where: { tenantId } }),
      db.purchaseOrder.count({ where: { tenantId, status: "PARTIAL" } }),
      db.purchaseOrder.count({ where: { tenantId, status: "SENT" } }),
      db.purchaseOrder.count({
        where: { tenantId, status: "SENT", createdAt: { lt: new Date(now.getTime() - 14 * 86400000) } },
      }),
    ]);
    summary = { ...summary, totalPedidos: total, pedidosParciales: partial, pedidosEnviados: sent, retrasadosMas14d: overdueDelivery };
  } else if (agentCode === "warehouse") {
    const [pendingRec, incidents, damaged, lowStock] = await Promise.all([
      db.reception.count({ where: { tenantId, status: { in: ["PENDING", "CHECKING"] } } }),
      db.incident.count({ where: { tenantId, status: { in: ["REGISTERED", "NOTIFIED"] } } }),
      db.incident.count({ where: { tenantId, type: "DAMAGED", status: { not: "CLOSED" } } }),
      db.productInventory.count({ where: { tenantId, available: { lte: 0 } } }),
    ]);
    summary = { ...summary, recepcionesPendientes: pendingRec, incidenciasAbiertas: incidents, productosDañados: damaged, productosSinStock: lowStock };
  } else if (agentCode === "delivery") {
    const [active, inTransit, failedToday, scheduledToday, proofsMissing] = await Promise.all([
      db.delivery.count({ where: { tenantId, status: { in: ["ASSIGNED", "IN_TRANSIT"] } } }),
      db.delivery.count({ where: { tenantId, status: "IN_TRANSIT" } }),
      db.delivery.count({ where: { tenantId, status: "FAILED", deliveredAt: { gte: today } } }),
      db.delivery.count({ where: { tenantId, scheduledDate: { gte: today, lt: in7 } } }),
      db.delivery.count({ where: { tenantId, status: "DELIVERED", proofRequired: true, proofs: { none: {} } } }),
    ]);
    summary = { ...summary, entregasActivas: active, enTransito: inTransit, fallidasHoy: failedToday, programadas7d: scheduledToday, sinPruebaRequerida: proofsMissing };
  } else if (agentCode === "treasury") {
    const [overdueExpense, overdueIncome, upcoming7, paidLast30] = await Promise.all([
      db.treasuryEntry.count({ where: { tenantId, type: { in: ["EXPENSE_EXPECTED"] }, dueDate: { lt: now }, status: { not: "PAID" } } }),
      db.treasuryEntry.count({ where: { tenantId, type: { in: ["INCOME_EXPECTED"] }, dueDate: { lt: now }, status: { not: "PAID" } } }),
      db.treasuryEntry.count({ where: { tenantId, status: "UPCOMING", dueDate: { lte: in7 } } }),
      db.treasuryEntry.count({ where: { tenantId, status: "PAID", paidDate: { gte: new Date(now.getTime() - 30 * 86400000) } } }),
    ]);
    summary = { ...summary, pagosVencidos: overdueExpense, cobrosVencidos: overdueIncome, proximos7d: upcoming7, pagadosUltimos30d: paidLast30 };
  } else if (agentCode === "billing") {
    const [trialsExpiring, pastDue, active, totalTenants] = await Promise.all([
      db.tenantSubscription.count({ where: { status: "TRIAL", trialEndsAt: { lte: new Date(now.getTime() + 14 * 86400000), gte: now } } }),
      db.tenantSubscription.count({ where: { status: "PAST_DUE" } }),
      db.tenantSubscription.count({ where: { status: "ACTIVE" } }),
      db.tenant.count({ where: { active: true } }),
    ]);
    summary = { ...summary, trialsProximos14d: trialsExpiring, tenantsPastDue: pastDue, tenantsActivos: active, totalTenants };
  } else if (agentCode === "security") {
    const [criticalEvents, failedLogins24h, lockedUsers, mfaEnabled] = await Promise.all([
      db.securityEvent.count({ where: { severity: "CRITICAL", createdAt: { gte: new Date(now.getTime() - 7 * 86400000) } } }),
      db.securityEvent.count({ where: { type: "LOGIN_FAILED", createdAt: { gte: new Date(now.getTime() - 86400000) } } }),
      db.user.count({ where: { tenantId, lockedUntil: { gt: now } } }),
      db.userMfa.count({ where: { tenantId, enabled: true } }),
    ]);
    summary = { ...summary, eventosCriticos7d: criticalEvents, loginsFallidos24h: failedLogins24h, cuentasBloqueadas: lockedUsers, usuariosConMfa: mfaEnabled };
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
