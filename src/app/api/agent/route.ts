import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { askAgentCognitive, buildContextPack } from "@/services/ai-cognitive.service";
import { ensureAgentsSeeded } from "@/services/ai-agent.service";
import { generateBriefing, detectAnomalies } from "@/lib/gemini";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const userId = session.user.id;
  const body = await req.json();
  const { action, message, agentCode: requestedAgent } = body;

  await ensureAgentsSeeded();

  // V8.1: Use cognitive layer with real agent
  const agentCode = requestedAgent || "executive";

  if (action === "chat") {
    try {
      const contextPack = await buildContextPack(tenantId, agentCode);
      const contextStr = JSON.stringify(contextPack, null, 2);
      const response = await askAgentCognitive(tenantId, agentCode, message || "¿Cómo está el negocio?", contextStr);

      // Persist conversation
      await persistTurn(tenantId, userId, agentCode, message || "¿Cómo está el negocio?", response);

      return NextResponse.json({ response, agentCode });
    } catch (e) {
      console.error("[agent] cognitive chat error:", e);
      return NextResponse.json({ response: "Error al procesar. Inténtalo de nuevo.", agentCode });
    }
  }

  if (action === "briefing") {
    try {
      const contextPack = await buildContextPack(tenantId, "executive");
      const contextStr = JSON.stringify(contextPack, null, 2);
      const response = await askAgentCognitive(
        tenantId, "executive",
        "Genera un briefing ejecutivo del día. Prioridades, riesgos y acciones concretas.",
        contextStr,
      );

      await persistTurn(tenantId, userId, "executive", "Briefing del día", response);

      return NextResponse.json({ response, agentCode: "executive" });
    } catch (e) {
      console.error("[agent] briefing error:", e);
      const fallback = await generateBriefing(JSON.stringify(await buildContextPack(tenantId, "executive")));
      return NextResponse.json({ response: fallback, agentCode: "executive" });
    }
  }

  if (action === "anomalies") {
    const contextPack = await buildContextPack(tenantId, "executive");
    const alerts = await detectAnomalies(JSON.stringify(contextPack));
    return NextResponse.json({ alerts });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

async function persistTurn(tenantId: string, userId: string, agentCode: string, userMessage: string, agentResponse: string) {
  try {
    const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
    if (!agent) return;

    const conversation = await db.aiConversation.create({
      data: {
        tenantId,
        agentId: agent.id,
        userId,
        scopeType: "MODULE",
      },
    });

    await db.aiMessage.createMany({
      data: [
        { conversationId: conversation.id, role: "USER_MSG", content: userMessage },
        { conversationId: conversation.id, role: "AGENT_MSG", content: agentResponse },
      ],
    });
  } catch (e) {
    console.error("[agent] persist turn error:", e);
  }
}
