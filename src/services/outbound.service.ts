import { db } from "@/lib/db";
import type { MessageChannel, OutboundMessageStatus } from "@prisma/client";

export async function enqueueMessage(tenantId: string, data: {
  channel: MessageChannel;
  targetType: string;
  targetId?: string;
  destination: string;
  subject?: string;
  body: string;
  eventType: string;
  sourceType?: string;
  sourceId?: string;
}) {
  // Deduplication: check if same message was created in last 5 min
  const fiveMinAgo = new Date(Date.now() - 5 * 60000);
  const existing = await db.outboundMessage.findFirst({
    where: {
      tenantId,
      eventType: data.eventType,
      sourceType: data.sourceType || null,
      sourceId: data.sourceId || null,
      channel: data.channel,
      targetId: data.targetId || null,
      createdAt: { gte: fiveMinAgo },
    },
  });
  if (existing) return existing;

  return db.outboundMessage.create({
    data: {
      tenantId,
      channel: data.channel,
      targetType: data.targetType,
      targetId: data.targetId || null,
      destination: data.destination,
      subject: data.subject || null,
      body: data.body,
      eventType: data.eventType,
      sourceType: data.sourceType || null,
      sourceId: data.sourceId || null,
    },
  });
}

export async function listMessages(tenantId: string, statusFilter?: string) {
  return db.outboundMessage.findMany({
    where: {
      tenantId,
      ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter as OutboundMessageStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function retryMessage(id: string, tenantId: string) {
  const msg = await db.outboundMessage.findFirst({
    where: { id, tenantId, status: "FAILED" },
  });
  if (!msg) throw new Error("Mensaje no encontrado o no esta fallido");
  if (msg.attempts >= msg.maxAttempts) throw new Error("Maximo de reintentos alcanzado");

  return db.outboundMessage.update({
    where: { id },
    data: { status: "QUEUED", nextAttemptAt: new Date() },
  });
}

export async function cancelMessage(id: string, tenantId: string) {
  return db.outboundMessage.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}

export async function processQueue(tenantId: string) {
  const now = new Date();
  const messages = await db.outboundMessage.findMany({
    where: {
      tenantId,
      status: "QUEUED",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  const results = [];
  for (const msg of messages) {
    await db.outboundMessage.update({ where: { id: msg.id }, data: { status: "PROCESSING" } });

    try {
      // Dispatch to channel provider
      if (msg.channel === "EMAIL") {
        await sendEmail(msg.destination, msg.subject || "", msg.body);
      } else if (msg.channel === "PUSH") {
        // Push handled separately via DeviceSubscription
        console.log(`[push] Would send to ${msg.destination}`);
      } else if (msg.channel === "WHATSAPP") {
        await sendWhatsApp(msg.destination, msg.body);
      }

      await db.outboundMessage.update({
        where: { id: msg.id },
        data: { status: "SENT", sentAt: new Date(), attempts: msg.attempts + 1 },
      });
      results.push({ id: msg.id, status: "SENT" });
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      const newAttempts = msg.attempts + 1;
      const isFinal = newAttempts >= msg.maxAttempts;

      await db.outboundMessage.update({
        where: { id: msg.id },
        data: {
          status: isFinal ? "FAILED" : "QUEUED",
          attempts: newAttempts,
          lastError: error,
          nextAttemptAt: isFinal ? null : new Date(Date.now() + newAttempts * 60000),
        },
      });
      results.push({ id: msg.id, status: isFinal ? "FAILED" : "RETRY", error });
    }
  }
  return results;
}

async function sendEmail(to: string, subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "TodoMueble <noreply@todomuebleguardamar.com>",
      to, subject, text: body,
    }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status}`);
}

async function sendWhatsApp(phone: string, body: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiUrl = process.env.WHATSAPP_API_URL;
  if (!token || !phoneId || !apiUrl) throw new Error("WhatsApp not configured");

  const res = await fetch(`${apiUrl}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp failed: ${res.status}`);
}
