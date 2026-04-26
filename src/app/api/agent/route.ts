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

  const agentCode = requestedAgent || "executive";

  if (action === "chat") {
    try {
      const contextPack = await buildContextPack(tenantId, agentCode);
      const contextStr = JSON.stringify(contextPack, null, 2);
      const userMessage = message || "¿Cómo está el negocio?";
      const response = await askAgentCognitive(tenantId, agentCode, userMessage, contextStr);

      const persisted = await persistTurn(tenantId, userId, agentCode, userMessage, response);

      return NextResponse.json({
        response,
        agentCode,
        conversationId: persisted?.conversationId,
        messageId: persisted?.agentMessageId,
      });
    } catch (e) {
      console.error("[agent] cognitive chat error:", e);
      return NextResponse.json({ response: "Error al procesar. Inténtalo de nuevo.", agentCode });
    }
  }

  if (action === "briefing") {
    try {
      const contextPack = await buildContextPack(tenantId, "executive");
      const contextStr = JSON.stringify(contextPack, null, 2);
      const userMessage = "Genera un briefing ejecutivo del día. Prioridades, riesgos y acciones concretas.";
      const response = await askAgentCognitive(tenantId, "executive", userMessage, contextStr);

      const persisted = await persistTurn(tenantId, userId, "executive", "Briefing del día", response);

      return NextResponse.json({
        response,
        agentCode: "executive",
        conversationId: persisted?.conversationId,
        messageId: persisted?.agentMessageId,
      });
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

async function persistTurn(
  tenantId: string,
  userId: string,
  agentCode: string,
  userMessage: string,
  agentResponse: string,
): Promise<{ conversationId: string; agentMessageId: string } | null> {
  try {
    const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
    if (!agent) return null;

    const conversation = await db.aiConversation.create({
      data: {
        tenantId,
        agentId: agent.id,
        userId,
        scopeType: "MODULE",
      },
    });

    await db.aiMessage.create({
      data: { conversationId: conversation.id, role: "USER_MSG", content: userMessage },
    });
    const agentMessage = await db.aiMessage.create({
      data: { conversationId: conversation.id, role: "AGENT_MSG", content: agentResponse },
    });

    return { conversationId: conversation.id, agentMessageId: agentMessage.id };
  } catch (e) {
    console.error("[agent] persist turn error:", e);
    return null;
  }
}
