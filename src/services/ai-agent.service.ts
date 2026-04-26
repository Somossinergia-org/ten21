import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AGENT_REGISTRY } from "@/lib/ai/agents/registry";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function ensureAgentsSeeded() {
  const count = await db.aiAgent.count();
  if (count >= AGENT_REGISTRY.length) return;

  for (const def of AGENT_REGISTRY) {
    await db.aiAgent.upsert({
      where: { code: def.code },
      create: {
        code: def.code, name: def.name,
        domain: def.domain,
        visibilityScope: def.visibility as "TENANT" | "INTERNAL" | "GLOBAL",
      },
      update: {},
    });
  }
}

export async function getAgentsForTenant(tenantId: string, role: string) {
  const agents = await db.aiAgent.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
  });

  return agents.filter((a) => {
    const def = AGENT_REGISTRY.find((d) => d.code === a.code);
    if (!def) return false;
    return def.roles.includes(role);
  });
}

export async function getInsights(tenantId: string, agentCode?: string) {
  return db.aiInsight.findMany({
    where: {
      tenantId,
      status: { in: ["NEW", "ACKNOWLEDGED"] },
      ...(agentCode ? { agent: { code: agentCode } } : {}),
    },
    include: { agent: { select: { code: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getActionSuggestions(tenantId: string, agentCode?: string) {
  return db.aiActionSuggestion.findMany({
    where: {
      tenantId,
      status: { in: ["AI_OPEN", "ACCEPTED"] },
      ...(agentCode ? { agent: { code: agentCode } } : {}),
    },
    include: { agent: { select: { code: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getDailyBrief(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.aiDailyBrief.findUnique({
    where: { tenantId_generatedForDate: { tenantId, generatedForDate: today } },
  });
}

export async function generateDailyBrief(tenantId: string, context: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Eres el Asistente Ejecutivo de una tienda de muebles y electrodomesticos. Genera un BRIEFING EJECUTIVO del dia en español. Maximo 5 puntos. Estilo directo, ejecutivo. Incluye: prioridades, riesgos, acciones recomendadas.\n\nDATOS DEL NEGOCIO:\n${context}` }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
    });

    const summary = result.response.text();

    return db.aiDailyBrief.upsert({
      where: { tenantId_generatedForDate: { tenantId, generatedForDate: today } },
      create: { tenantId, generatedForDate: today, executiveSummary: summary },
      update: { executiveSummary: summary },
    });
  } catch (e) {
    console.error("[ai-agent] Daily brief error:", e);
    return null;
  }
}

export async function askAgent(tenantId: string, agentCode: string, question: string, context: string) {
  const def = AGENT_REGISTRY.find((d) => d.code === agentCode);
  if (!def) throw new Error("Agente no encontrado");

  const prompt = `Eres ${def.name}, especialista en ${def.domain} para una tienda de muebles y electrodomesticos.
Tu mision: ${def.mission}
KPIs que observas: ${def.kpis.join(", ") || "generales del dominio"}

REGLAS:
- Responde en español, maximo 4-5 frases
- Basa tus respuestas en los datos proporcionados
- Distingue hechos, inferencias y recomendaciones
- Si no tienes datos suficientes, dilo claramente
- No inventes datos

DATOS ACTUALES:
${context}

PREGUNTA:
${question}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.5 },
    });
    return result.response.text();
  } catch (e) {
    console.error(`[ai-agent] ${agentCode} error:`, e);
    return "No he podido procesar la consulta. Intentalo de nuevo.";
  }
}

export async function createInsight(tenantId: string, agentCode: string, data: {
  entityType?: string; entityId?: string; severity: string;
  category: string; title: string; summary: string;
  evidenceJson?: object; confidenceScore?: number;
}) {
  const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
  if (!agent) return null;

  return db.aiInsight.create({
    data: {
      tenantId, agentId: agent.id,
      entityType: data.entityType || null,
      entityId: data.entityId || null,
      severity: data.severity as "AI_INFO" | "AI_WARNING" | "AI_HIGH" | "AI_CRITICAL",
      category: data.category,
      title: data.title,
      summary: data.summary,
      evidenceJson: data.evidenceJson as object || undefined,
      confidenceScore: data.confidenceScore,
    },
  });
}

export async function createActionSuggestion(tenantId: string, agentCode: string, data: {
  targetType: string; targetId?: string; priority?: string;
  title: string; recommendation: string; rationale: string;
  evidenceJson?: object; insightId?: string;
}) {
  const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
  if (!agent) return null;

  return db.aiActionSuggestion.create({
    data: {
      tenantId, agentId: agent.id,
      targetType: data.targetType,
      targetId: data.targetId || null,
      priority: (data.priority || "AI_NORMAL") as "AI_LOW" | "AI_NORMAL" | "AI_HIGH" | "AI_URGENT",
      title: data.title,
      recommendation: data.recommendation,
      rationale: data.rationale,
      evidenceJson: data.evidenceJson as object || undefined,
      createdByInsightId: data.insightId || null,
    },
  });
}
