import { db } from "@/lib/db";
import * as outbound from "@/services/outbound.service";
import type { MessageChannel, AutomationTarget } from "@prisma/client";

export async function listRules(tenantId: string) {
  return db.automationRule.findMany({
    where: { tenantId },
    include: { template: { select: { code: true, subject: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listTemplates(tenantId: string) {
  return db.notificationTemplate.findMany({
    where: { tenantId },
    orderBy: { code: "asc" },
  });
}

export async function createRule(tenantId: string, data: {
  code: string; eventType: string; channel: string; target: string;
  templateId?: string; conditionsJson?: unknown; createdById: string;
}) {
  return db.automationRule.create({
    data: {
      tenantId, code: data.code,
      eventType: data.eventType,
      channel: data.channel as MessageChannel,
      target: data.target as AutomationTarget,
      templateId: data.templateId || null,
      conditionsJson: data.conditionsJson ? data.conditionsJson as object : undefined,
      createdById: data.createdById,
    },
  });
}

export async function toggleRule(id: string, tenantId: string) {
  const rule = await db.automationRule.findFirst({ where: { id, tenantId } });
  if (!rule) throw new Error("Regla no encontrada");
  return db.automationRule.update({
    where: { id },
    data: { enabled: !rule.enabled },
  });
}

export async function createTemplate(tenantId: string, data: {
  code: string; channel: string; eventType: string; subject?: string; body: string;
}) {
  return db.notificationTemplate.create({
    data: {
      tenantId, code: data.code,
      channel: data.channel as MessageChannel,
      eventType: data.eventType,
      subject: data.subject || null,
      body: data.body,
    },
  });
}

export async function dispatchEvent(tenantId: string, eventType: string, context: {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAllowEmail?: boolean;
  customerAllowWhatsApp?: boolean;
  sourceType?: string;
  sourceId?: string;
  body?: string;
}) {
  const rules = await db.automationRule.findMany({
    where: { tenantId, eventType, enabled: true },
    include: { template: true },
  });

  for (const rule of rules) {
    const body = rule.template?.body || context.body || `Evento: ${eventType}`;
    const subject = rule.template?.subject || eventType;

    if (rule.target === "CUSTOMER" && context.customerId) {
      if (rule.channel === "EMAIL" && context.customerEmail && context.customerAllowEmail) {
        await outbound.enqueueMessage(tenantId, {
          channel: "EMAIL", targetType: "CUSTOMER", targetId: context.customerId,
          destination: context.customerEmail, subject, body,
          eventType, sourceType: context.sourceType, sourceId: context.sourceId,
        });
      }
      if (rule.channel === "WHATSAPP" && context.customerPhone && context.customerAllowWhatsApp) {
        await outbound.enqueueMessage(tenantId, {
          channel: "WHATSAPP", targetType: "CUSTOMER", targetId: context.customerId,
          destination: context.customerPhone, body,
          eventType, sourceType: context.sourceType, sourceId: context.sourceId,
        });
      }
    }

    if (rule.target === "ROLE" || rule.target === "USER") {
      // Push to JEFE users
      const users = await db.user.findMany({
        where: { tenantId, role: "JEFE", active: true },
        select: { id: true, email: true },
      });
      for (const u of users) {
        if (rule.channel === "PUSH") {
          await outbound.enqueueMessage(tenantId, {
            channel: "PUSH", targetType: "USER", targetId: u.id,
            destination: u.id, subject, body,
            eventType, sourceType: context.sourceType, sourceId: context.sourceId,
          });
        }
        if (rule.channel === "EMAIL" && u.email) {
          await outbound.enqueueMessage(tenantId, {
            channel: "EMAIL", targetType: "USER", targetId: u.id,
            destination: u.email, subject, body,
            eventType, sourceType: context.sourceType, sourceId: context.sourceId,
          });
        }
      }
    }
  }
}
