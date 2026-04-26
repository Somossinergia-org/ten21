import { db } from "@/lib/db";
import { buildContextPack } from "@/services/ai-cognitive.service";
import type { Prisma } from "@prisma/client";

type Severity = "AI_INFO" | "AI_WARNING" | "AI_HIGH" | "AI_CRITICAL";
type ActionPriority = "AI_LOW" | "AI_NORMAL" | "AI_HIGH" | "AI_URGENT";
type HandoffUrgency = "HANDOFF_LOW" | "HANDOFF_NORMAL" | "HANDOFF_HIGH" | "HANDOFF_URGENT";

export const PRIORITY_BY_SEVERITY: Record<Severity, ActionPriority> = {
  AI_INFO: "AI_LOW",
  AI_WARNING: "AI_NORMAL",
  AI_HIGH: "AI_HIGH",
  AI_CRITICAL: "AI_URGENT",
};

type InsightSpec = {
  ruleKey: string;
  agentCode: string;
  severity: Severity;
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  action?: {
    targetType: string;
    title: string;
    recommendation: string;
    rationale: string;
  };
  handoff?: {
    toAgent: string;
    reason: string;
    urgency: HandoffUrgency;
  };
};

export async function createInsightIfNeeded(tenantId: string, spec: InsightSpec) {
  const agent = await db.aiAgent.findUnique({ where: { code: spec.agentCode } });
  if (!agent) return null;

  const existing = await db.aiInsight.findFirst({
    where: {
      tenantId,
      agentId: agent.id,
      category: spec.ruleKey,
      status: { in: ["NEW", "ACKNOWLEDGED"] },
    },
  });

  if (existing) {
    return db.aiInsight.update({
      where: { id: existing.id },
      data: {
        title: spec.title,
        summary: spec.summary,
        severity: spec.severity,
        evidenceJson: {
          ...((existing.evidenceJson as object) || {}),
          ...spec.evidence,
          lastSeenAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
  }

  return db.aiInsight.create({
    data: {
      tenantId,
      agentId: agent.id,
      severity: spec.severity,
      category: spec.ruleKey,
      title: spec.title,
      summary: spec.summary,
      confidenceScore: 95,
      evidenceJson: {
        ...spec.evidence,
        firstSeenAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    },
  });
}

export async function createActionSuggestionIfNeeded(
  tenantId: string,
  agentCode: string,
  insightId: string,
  spec: {
    targetType: string;
    title: string;
    recommendation: string;
    rationale: string;
    priority: ActionPriority;
    evidence: Record<string, unknown>;
  },
) {
  const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
  if (!agent) return null;

  const existing = await db.aiActionSuggestion.findFirst({
    where: {
      tenantId,
      agentId: agent.id,
      targetType: spec.targetType,
      createdByInsightId: insightId,
      status: { in: ["AI_OPEN", "ACCEPTED"] },
    },
  });

  if (existing) {
    return db.aiActionSuggestion.update({
      where: { id: existing.id },
      data: {
        title: spec.title,
        recommendation: spec.recommendation,
        rationale: spec.rationale,
        priority: spec.priority,
      },
    });
  }

  return db.aiActionSuggestion.create({
    data: {
      tenantId,
      agentId: agent.id,
      targetType: spec.targetType,
      priority: spec.priority,
      title: spec.title,
      recommendation: spec.recommendation,
      rationale: spec.rationale,
      requiresConfirmation: true,
      createdByInsightId: insightId,
      evidenceJson: spec.evidence as Prisma.InputJsonValue,
    },
  });
}

export async function createHandoffIfNeeded(
  tenantId: string,
  fromCode: string,
  toCode: string,
  reason: string,
  payload: Record<string, unknown>,
  urgency: HandoffUrgency = "HANDOFF_NORMAL",
) {
  const [from, to] = await Promise.all([
    db.aiAgent.findUnique({ where: { code: fromCode } }),
    db.aiAgent.findUnique({ where: { code: toCode } }),
  ]);
  if (!from || !to) return null;

  const existing = await db.aiHandoff.findFirst({
    where: {
      tenantId,
      fromAgentId: from.id,
      toAgentId: to.id,
      reason,
      status: { in: ["HANDOFF_CREATED", "HANDOFF_ACCEPTED"] },
    },
  });

  if (existing) {
    return db.aiHandoff.update({
      where: { id: existing.id },
      data: { payloadJson: payload as Prisma.InputJsonValue, urgency },
    });
  }

  return db.aiHandoff.create({
    data: {
      tenantId,
      fromAgentId: from.id,
      toAgentId: to.id,
      reason,
      urgency,
      payloadJson: payload as Prisma.InputJsonValue,
    },
  });
}

async function autoResolveIfGone(tenantId: string, agentCode: string, activeRuleKeys: Set<string>) {
  const agent = await db.aiAgent.findUnique({ where: { code: agentCode } });
  if (!agent) return;

  const open = await db.aiInsight.findMany({
    where: { tenantId, agentId: agent.id, status: { in: ["NEW", "ACKNOWLEDGED"] } },
    select: { id: true, category: true, evidenceJson: true },
  });

  for (const ins of open) {
    if (!activeRuleKeys.has(ins.category)) {
      await db.aiInsight.update({
        where: { id: ins.id },
        data: {
          status: "DISMISSED",
          evidenceJson: {
            ...((ins.evidenceJson as object) || {}),
            autoResolved: true,
            resolvedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }
  }
}

async function applySpec(tenantId: string, spec: InsightSpec) {
  const insight = await createInsightIfNeeded(tenantId, spec);
  if (!insight) return;
  if (spec.action) {
    await createActionSuggestionIfNeeded(tenantId, spec.agentCode, insight.id, {
      targetType: spec.action.targetType,
      title: spec.action.title,
      recommendation: spec.action.recommendation,
      rationale: spec.action.rationale,
      priority: PRIORITY_BY_SEVERITY[spec.severity],
      evidence: spec.evidence,
    });
  }
  if (spec.handoff) {
    await createHandoffIfNeeded(
      tenantId,
      spec.agentCode,
      spec.handoff.toAgent,
      spec.handoff.reason,
      { insightId: insight.id, ...spec.evidence },
      spec.handoff.urgency,
    );
  }
}

function num(obj: unknown, key: string): number {
  if (!obj || typeof obj !== "object") return 0;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "number" ? v : 0;
}

export async function runInsightSweep(tenantId: string) {
  const activeKeys = new Set<string>();
  const specs: InsightSpec[] = [];

  const [treasury, sales, purchase, warehouse, delivery, billing, security] = await Promise.all([
    buildContextPack(tenantId, "treasury"),
    buildContextPack(tenantId, "sales"),
    buildContextPack(tenantId, "purchase"),
    buildContextPack(tenantId, "warehouse"),
    buildContextPack(tenantId, "delivery"),
    buildContextPack(tenantId, "billing"),
    buildContextPack(tenantId, "security"),
  ]);

  // Treasury
  const overdueExp = num(treasury, "pagosVencidos");
  if (overdueExp >= 1) {
    const severity: Severity = overdueExp >= 5 ? "AI_CRITICAL" : "AI_HIGH";
    specs.push({
      ruleKey: "treasury:overdue-expenses",
      agentCode: "treasury",
      severity,
      title: `${overdueExp} pagos vencidos sin liquidar`,
      summary: `Hay ${overdueExp} pagos vencidos pendientes. Prioriza liquidación según criticidad de proveedor.`,
      evidence: { metric: "pagosVencidos", value: overdueExp, threshold: 1 },
      action: {
        targetType: "TreasuryEntry",
        title: "Priorizar pagos vencidos",
        recommendation: "Revisa pagos vencidos y ordena según criticidad del proveedor.",
        rationale: `${overdueExp} pagos vencidos; riesgo reputacional y operativo.`,
      },
      handoff: overdueExp >= 5
        ? { toAgent: "executive", reason: "Riesgo de tesorería crítico", urgency: "HANDOFF_URGENT" }
        : undefined,
    });
  }

  const overdueInc = num(treasury, "cobrosVencidos");
  if (overdueInc >= 1) {
    const severity: Severity = overdueInc >= 5 ? "AI_HIGH" : "AI_WARNING";
    specs.push({
      ruleKey: "treasury:overdue-income",
      agentCode: "treasury",
      severity,
      title: `${overdueInc} cobros vencidos`,
      summary: `${overdueInc} cobros vencidos pendientes. Reclama empezando por importes mayores.`,
      evidence: { metric: "cobrosVencidos", value: overdueInc },
      action: {
        targetType: "TreasuryEntry",
        title: "Reclamar cobros vencidos",
        recommendation: "Contacta clientes con cobros vencidos; empieza por importes mayores.",
        rationale: `${overdueInc} cobros vencidos afectando caja.`,
      },
      handoff: overdueInc >= 5
        ? { toAgent: "sales", reason: "Cobros vencidos requieren gestión comercial", urgency: "HANDOFF_HIGH" }
        : undefined,
    });
  }

  const upcoming = num(treasury, "proximos7d");
  if (upcoming >= 10) {
    specs.push({
      ruleKey: "treasury:upcoming-load",
      agentCode: "treasury",
      severity: "AI_INFO",
      title: `Alta carga de vencimientos próximos 7 días`,
      summary: `${upcoming} vencimientos en los próximos 7 días. Valida caja suficiente.`,
      evidence: { metric: "proximos7d", value: upcoming },
      action: {
        targetType: "TreasuryEntry",
        title: "Revisar proyección de caja 7d",
        recommendation: "Valida que hay caja para cubrir los vencimientos próximos.",
        rationale: `${upcoming} vencimientos próximos.`,
      },
    });
  }

  // Sales
  const negMargin = num(sales, "margenNegativo");
  if (negMargin >= 1) {
    const severity: Severity = negMargin >= 3 ? "AI_CRITICAL" : "AI_HIGH";
    specs.push({
      ruleKey: "sales:negative-margin",
      agentCode: "sales",
      severity,
      title: `${negMargin} ventas con margen negativo`,
      summary: `Detectados ${negMargin} pedidos con margen estimado negativo. Revisa antes de confirmar.`,
      evidence: { metric: "margenNegativo", value: negMargin },
      action: {
        targetType: "SalesOrder",
        title: "Auditar pedidos con margen negativo",
        recommendation: "Revisa líneas y corrige precios o costes.",
        rationale: `${negMargin} pedidos con margen negativo.`,
      },
      handoff: negMargin >= 3
        ? { toAgent: "treasury", reason: "Impacto en caja por margen negativo", urgency: "HANDOFF_HIGH" }
        : undefined,
    });
  }

  const drafts = num(sales, "borradores");
  if (drafts >= 10) {
    specs.push({
      ruleKey: "sales:stalled-drafts",
      agentCode: "sales",
      severity: "AI_WARNING",
      title: `${drafts} borradores de venta sin cerrar`,
      summary: `Tienes ${drafts} borradores acumulados. Revisa y cierra o descarta.`,
      evidence: { metric: "borradores", value: drafts },
      action: {
        targetType: "SalesOrder",
        title: "Cerrar o descartar borradores antiguos",
        recommendation: "Revisa borradores antiguos y decide.",
        rationale: `${drafts} borradores sin cerrar.`,
      },
    });
  }

  // Purchase
  const latePO = num(purchase, "retrasadosMas14d");
  if (latePO >= 1) {
    specs.push({
      ruleKey: "purchase:late-orders",
      agentCode: "purchase",
      severity: "AI_HIGH",
      title: `${latePO} pedidos de compra retrasados >14d`,
      summary: `${latePO} pedidos llevan más de 14 días sin recibir.`,
      evidence: { metric: "retrasadosMas14d", value: latePO },
      action: {
        targetType: "PurchaseOrder",
        title: "Contactar proveedores retrasados",
        recommendation: "Llama o escribe a proveedores con pedidos retrasados.",
        rationale: `${latePO} pedidos retrasados >14d.`,
      },
      handoff: { toAgent: "warehouse", reason: "Almacén debe planear entrada tardía", urgency: "HANDOFF_NORMAL" },
    });
  }

  const partials = num(purchase, "pedidosParciales");
  if (partials >= 5) {
    specs.push({
      ruleKey: "purchase:high-partials",
      agentCode: "purchase",
      severity: "AI_WARNING",
      title: `${partials} pedidos parciales acumulados`,
      summary: `Hay ${partials} pedidos en estado parcial. Confirma si completan o cierran.`,
      evidence: { metric: "pedidosParciales", value: partials },
      action: {
        targetType: "PurchaseOrder",
        title: "Revisar pedidos parciales",
        recommendation: "Decide si los parciales completan o se cierran.",
        rationale: `${partials} parciales.`,
      },
    });
  }

  // Warehouse
  const pendingRec = num(warehouse, "recepcionesPendientes");
  if (pendingRec >= 5) {
    const severity: Severity = pendingRec >= 20 ? "AI_CRITICAL" : "AI_HIGH";
    specs.push({
      ruleKey: "warehouse:reception-backlog",
      agentCode: "warehouse",
      severity,
      title: `Backlog de ${pendingRec} recepciones pendientes`,
      summary: `Hay ${pendingRec} recepciones por procesar. Organiza equipo para cerrarlas.`,
      evidence: { metric: "recepcionesPendientes", value: pendingRec },
      action: {
        targetType: "Reception",
        title: "Procesar backlog de recepciones",
        recommendation: "Organiza equipo para cerrar recepciones pendientes hoy.",
        rationale: `${pendingRec} recepciones pendientes.`,
      },
    });
  }

  const damaged = num(warehouse, "productosDañados");
  if (damaged >= 1) {
    specs.push({
      ruleKey: "warehouse:damaged-goods",
      agentCode: "warehouse",
      severity: "AI_HIGH",
      title: `Mercancía dañada sin cerrar (${damaged})`,
      summary: `${damaged} incidencias de daño abiertas. Cierra o escala.`,
      evidence: { metric: "productosDañados", value: damaged },
      action: {
        targetType: "Incident",
        title: "Cerrar incidencias de daño",
        recommendation: "Resuelve incidencias de mercancía dañada.",
        rationale: `${damaged} incidencias dañadas abiertas.`,
      },
      handoff: { toAgent: "purchase", reason: "Reclamar al proveedor", urgency: "HANDOFF_NORMAL" },
    });
  }

  const oos = num(warehouse, "productosSinStock");
  if (oos >= 1) {
    const severity: Severity = oos >= 10 ? "AI_HIGH" : "AI_WARNING";
    specs.push({
      ruleKey: "warehouse:out-of-stock",
      agentCode: "warehouse",
      severity,
      title: `${oos} referencias sin stock`,
      summary: `${oos} referencias con disponible ≤ 0. Planifica reposición.`,
      evidence: { metric: "productosSinStock", value: oos },
      action: {
        targetType: "Product",
        title: "Reponer referencias sin stock",
        recommendation: "Genera pedido de compra para referencias críticas.",
        rationale: `${oos} referencias sin stock.`,
      },
      handoff: oos >= 10
        ? { toAgent: "purchase", reason: "Reposición urgente", urgency: "HANDOFF_HIGH" }
        : undefined,
    });
  }

  // Delivery
  const failedToday = num(delivery, "fallidasHoy");
  if (failedToday >= 1) {
    specs.push({
      ruleKey: "delivery:failed-today",
      agentCode: "delivery",
      severity: "AI_HIGH",
      title: `${failedToday} entregas fallidas hoy`,
      summary: `${failedToday} entregas han fallado hoy. Reprograma con cliente.`,
      evidence: { metric: "fallidasHoy", value: failedToday },
      action: {
        targetType: "Delivery",
        title: "Reprogramar entregas fallidas",
        recommendation: "Contacta clientes y agenda nueva ventana.",
        rationale: `${failedToday} entregas fallidas hoy.`,
      },
      handoff: { toAgent: "sales", reason: "Comercial debe reagendar con el cliente", urgency: "HANDOFF_NORMAL" },
    });
  }

  const noProof = num(delivery, "sinPruebaRequerida");
  if (noProof >= 1) {
    specs.push({
      ruleKey: "delivery:missing-proofs",
      agentCode: "delivery",
      severity: "AI_WARNING",
      title: `${noProof} entregas sin prueba requerida`,
      summary: `${noProof} entregas marcadas DELIVERED sin prueba, cuando se requería.`,
      evidence: { metric: "sinPruebaRequerida", value: noProof },
      action: {
        targetType: "Delivery",
        title: "Obtener pruebas de entrega pendientes",
        recommendation: "Solicita foto o firma a repartidores.",
        rationale: `${noProof} entregas sin prueba.`,
      },
    });
  }

  const load7 = num(delivery, "programadas7d");
  if (load7 >= 30) {
    specs.push({
      ruleKey: "delivery:high-load-7d",
      agentCode: "delivery",
      severity: "AI_INFO",
      title: `Alta carga de entregas 7d (${load7})`,
      summary: `${load7} entregas programadas los próximos 7 días. Planifica rutas.`,
      evidence: { metric: "programadas7d", value: load7 },
      action: {
        targetType: "Delivery",
        title: "Planificar rutas 7d",
        recommendation: "Optimiza rutas y vehículos para cubrir la carga.",
        rationale: `${load7} entregas programadas.`,
      },
    });
  }

  // Billing (global)
  const pastDue = num(billing, "tenantsPastDue");
  if (pastDue >= 1) {
    const severity: Severity = pastDue >= 3 ? "AI_CRITICAL" : "AI_HIGH";
    specs.push({
      ruleKey: "billing:past-due",
      agentCode: "billing",
      severity,
      title: `${pastDue} tenants en past_due`,
      summary: `${pastDue} tenants tienen factura impagada. Activa cobranza.`,
      evidence: { metric: "tenantsPastDue", value: pastDue },
      action: {
        targetType: "TenantSubscription",
        title: "Activar proceso de cobranza SaaS",
        recommendation: "Notifica tenants past_due y activa dunning si procede.",
        rationale: `${pastDue} tenants past_due.`,
      },
    });
  }

  const trials = num(billing, "trialsProximos14d");
  if (trials >= 1) {
    specs.push({
      ruleKey: "billing:trial-expiring",
      agentCode: "billing",
      severity: "AI_INFO",
      title: `${trials} trials próximos a expirar`,
      summary: `${trials} trials expiran en menos de 14 días. Contacta.`,
      evidence: { metric: "trialsProximos14d", value: trials },
      action: {
        targetType: "TenantSubscription",
        title: "Contactar trials próximos a expirar",
        recommendation: "Prepara guía de conversión y contacta a cada trial.",
        rationale: `${trials} trials próximos.`,
      },
    });
  }

  // Security
  const criticalSec = num(security, "eventosCriticos7d");
  if (criticalSec >= 1) {
    specs.push({
      ruleKey: "security:critical-events-7d",
      agentCode: "security",
      severity: "AI_CRITICAL",
      title: `${criticalSec} eventos críticos de seguridad (7d)`,
      summary: `Detectados ${criticalSec} eventos críticos los últimos 7 días.`,
      evidence: { metric: "eventosCriticos7d", value: criticalSec },
      action: {
        targetType: "SecurityEvent",
        title: "Revisar eventos críticos de seguridad",
        recommendation: "Abre el log de seguridad y clasifica cada evento.",
        rationale: `${criticalSec} eventos críticos.`,
      },
      handoff: { toAgent: "billing", reason: "Afecta a tenants, revisar planes", urgency: "HANDOFF_HIGH" },
    });
  }

  const locked = num(security, "cuentasBloqueadas");
  if (locked >= 1) {
    specs.push({
      ruleKey: "security:locked-accounts",
      agentCode: "security",
      severity: "AI_WARNING",
      title: `${locked} cuentas bloqueadas`,
      summary: `${locked} cuentas están bloqueadas. Valida si legítimas.`,
      evidence: { metric: "cuentasBloqueadas", value: locked },
      action: {
        targetType: "User",
        title: "Desbloquear cuentas tras revisión",
        recommendation: "Valida si las cuentas bloqueadas son legítimas.",
        rationale: `${locked} cuentas bloqueadas.`,
      },
    });
  }

  const failedLogins = num(security, "loginsFallidos24h");
  if (failedLogins >= 20) {
    const severity: Severity = failedLogins >= 100 ? "AI_HIGH" : "AI_WARNING";
    specs.push({
      ruleKey: "security:failed-logins-24h",
      agentCode: "security",
      severity,
      title: `${failedLogins} logins fallidos en 24h`,
      summary: `Pico de logins fallidos 24h. Posible ataque.`,
      evidence: { metric: "loginsFallidos24h", value: failedLogins },
      action: {
        targetType: "SecurityEvent",
        title: "Investigar picos de login fallido",
        recommendation: "Identifica origen del pico y aplica bloqueo si procede.",
        rationale: `${failedLogins} logins fallidos en 24h.`,
      },
    });
  }

  // Executive agregador
  const highOrCritical = specs.filter((s) => s.severity === "AI_HIGH" || s.severity === "AI_CRITICAL");
  if (highOrCritical.length >= 2) {
    const hasCritical = highOrCritical.some((s) => s.severity === "AI_CRITICAL");
    specs.push({
      ruleKey: "executive:daily-digest",
      agentCode: "executive",
      severity: hasCritical ? "AI_CRITICAL" : "AI_HIGH",
      title: `Resumen ejecutivo: ${highOrCritical.length} asuntos críticos hoy`,
      summary: highOrCritical.map((s) => `• ${s.title}`).join("\n"),
      evidence: { count: highOrCritical.length, ruleKeys: highOrCritical.map((s) => s.ruleKey) },
      action: {
        targetType: "AiInsight",
        title: "Revisar asuntos críticos del día",
        recommendation: "Abre cockpit y revisa cada insight crítico abierto.",
        rationale: `${highOrCritical.length} asuntos críticos activos.`,
      },
    });
  }

  // Apply all specs
  const perAgent = new Map<string, Set<string>>();
  for (const s of specs) {
    activeKeys.add(s.ruleKey);
    if (!perAgent.has(s.agentCode)) perAgent.set(s.agentCode, new Set());
    perAgent.get(s.agentCode)!.add(s.ruleKey);
    await applySpec(tenantId, s);
  }

  // Auto-resolve insights that are no longer active
  const agentsSwept = ["treasury", "sales", "purchase", "warehouse", "delivery", "billing", "security", "executive"];
  for (const code of agentsSwept) {
    await autoResolveIfGone(tenantId, code, perAgent.get(code) || new Set());
  }

  return {
    tenantId,
    processed: specs.length,
    ruleKeys: Array.from(activeKeys),
  };
}

export async function getHandoffs(tenantId: string) {
  return db.aiHandoff.findMany({
    where: { tenantId, status: { in: ["HANDOFF_CREATED", "HANDOFF_ACCEPTED"] } },
    include: {
      fromAgent: { select: { code: true, name: true } },
      toAgent: { select: { code: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
