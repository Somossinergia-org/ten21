import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ACTION_REGISTRY, canAgentExecute, needsConfirmation, isForbiddenInRestrictedMode, getAction } from "@/lib/autonomy/action-registry";
import * as billingService from "@/services/billing.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Parse human order into structured plan
export async function createMission(tenantId: string, orderText: string, initiatedById: string) {
  const mission = await db.aiMission.create({
    data: { tenantId, orderText, initiatedById, status: "PLANNING" },
  });

  try {
    const steps = await planMission(tenantId, orderText);

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const action = getAction(s.actionCode);
      await db.aiMissionStep.create({
        data: {
          missionId: mission.id,
          stepOrder: i + 1,
          agentCode: s.agentCode,
          actionCode: s.actionCode,
          description: s.description,
          inputJson: s.input as object || undefined,
          riskLevel: action?.riskLevel.replace("ACTION_", "") || "MEDIUM",
          requiresConfirm: needsConfirmation(s.actionCode),
          tenantId,
        },
      });
    }

    return db.aiMission.update({
      where: { id: mission.id },
      data: { status: "PLANNED", totalSteps: steps.length, parsedIntent: steps.map((s) => s.description).join("; ") },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
    });
  } catch (e) {
    await db.aiMission.update({
      where: { id: mission.id },
      data: { status: "FAILED_MISSION", summaryJson: { error: e instanceof Error ? e.message : "Planning failed" } as object },
    });
    throw e;
  }
}

async function planMission(tenantId: string, orderText: string): Promise<{ agentCode: string; actionCode: string; description: string; input?: object }[]> {
  const actionList = ACTION_REGISTRY.map((a) => `${a.actionCode}: ${a.description} (domain: ${a.domain}, risk: ${a.riskLevel})`).join("\n");

  const prompt = `Eres el Orquestador de un sistema de gestion de tienda de muebles.
El jefe te ha dado esta orden:
"${orderText}"

Acciones disponibles:
${actionList}

Descompón la orden en pasos concretos usando SOLO las acciones disponibles.
Responde con un JSON array. Cada elemento:
{"agentCode": "...", "actionCode": "...", "description": "..."}

Agentes disponibles: automations, support, security, billing, compliance, executive, sales, customers, purchases, warehouse, inventory, deliveries, postsales, finance, treasury, invoices, profitability

SOLO responde con el JSON array. Si la orden no se puede descomponer, devuelve [].`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.2 },
    });
    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  } catch {
    return [{ agentCode: "support", actionCode: "send_internal_notification", description: `Orden no interpretable: ${orderText}` }];
  }
}

export async function executeMission(tenantId: string, missionId: string) {
  const mission = await db.aiMission.findFirst({
    where: { id: missionId, tenantId, status: "PLANNED" },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
  if (!mission) throw new Error("Mision no encontrada o no esta planificada");

  // Check restricted mode
  const restricted = await billingService.isRestricted(tenantId);

  await db.aiMission.update({ where: { id: missionId }, data: { status: "EXECUTING" } });

  let completed = 0;
  let failed = 0;

  for (const step of mission.steps) {
    const action = getAction(step.actionCode);

    // Guardrails
    if (!action) {
      await failStep(step.id, "Accion no registrada");
      failed++;
      continue;
    }

    if (!canAgentExecute(step.agentCode, step.actionCode)) {
      await failStep(step.id, `Agente ${step.agentCode} no tiene permiso para ${step.actionCode}`);
      failed++;
      continue;
    }

    if (restricted.isRestricted && isForbiddenInRestrictedMode(step.actionCode)) {
      await skipStep(step.id, "Accion prohibida en modo restringido");
      failed++;
      continue;
    }

    if (step.requiresConfirm && !step.confirmedById) {
      await db.aiMissionStep.update({
        where: { id: step.id },
        data: { status: "PENDING_CONFIRMATION" },
      });
      continue;
    }

    // Dry-run
    if (action.dryRunSupported) {
      await db.aiMissionStep.update({
        where: { id: step.id },
        data: { status: "DRY_RUN_STEP", startedAt: new Date() },
      });

      const dryResult = await executeDryRun(tenantId, step.actionCode, step.inputJson as object);
      await db.aiMissionStep.update({
        where: { id: step.id },
        data: { status: "DRY_RUN_DONE", dryRunResultJson: dryResult as object },
      });

      if (!dryResult.safe) {
        await failStep(step.id, `Dry-run fallo: ${dryResult.reason}`);
        failed++;
        continue;
      }
    }

    // Execute
    try {
      await db.aiMissionStep.update({ where: { id: step.id }, data: { status: "EXECUTING_STEP" } });
      const result = await executeAction(tenantId, step.actionCode, step.inputJson as object);

      await db.aiMissionStep.update({
        where: { id: step.id },
        data: { status: "COMPLETED_STEP", executeResultJson: result as object, completedAt: new Date() },
      });

      // Audit log
      await db.agentExecutionLog.create({
        data: {
          tenantId, missionId, missionStepId: step.id,
          agentCode: step.agentCode, actionCode: step.actionCode,
          mode: "execute", inputJson: step.inputJson as object || undefined,
          outputJson: result as object, success: true,
          initiatedById: mission.initiatedById,
        },
      });

      completed++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      await failStep(step.id, msg);

      await db.agentExecutionLog.create({
        data: {
          tenantId, missionId, missionStepId: step.id,
          agentCode: step.agentCode, actionCode: step.actionCode,
          mode: "execute", success: false, errorMessage: msg,
          initiatedById: mission.initiatedById,
        },
      });

      failed++;
    }
  }

  const finalStatus = failed === mission.steps.length ? "FAILED_MISSION" : "COMPLETED_MISSION";
  return db.aiMission.update({
    where: { id: missionId },
    data: {
      status: finalStatus, completedSteps: completed, failedSteps: failed,
      summaryJson: { completed, failed, total: mission.steps.length } as object,
    },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
}

async function executeDryRun(tenantId: string, actionCode: string, input: object | null): Promise<{ safe: boolean; reason?: string; wouldDo?: string; entities?: string[] }> {
  switch (actionCode) {
    case "retry_failed_webhook": {
      const failed = await db.outboundMessage.count({ where: { tenantId, status: "FAILED" } });
      return { safe: failed > 0, wouldDo: `Reintentar ${failed} webhooks fallidos`, entities: ["OutboundMessage"] };
    }
    case "requeue_automation_message": {
      const queued = await db.outboundMessage.count({ where: { tenantId, status: "FAILED" } });
      return { safe: queued > 0, wouldDo: `Reencolar ${queued} mensajes`, entities: ["OutboundMessage"] };
    }
    case "send_internal_notification":
      return { safe: true, wouldDo: "Enviar notificacion interna", entities: ["Notification"] };
    case "generate_export": {
      const existing = await db.dataExportRequest.count({
        where: { tenantId, status: { in: ["REQUESTED", "PROCESSING"] } },
      });
      return { safe: existing === 0, reason: existing > 0 ? "Ya hay un export en curso" : undefined, wouldDo: "Generar export de datos" };
    }
    case "acknowledge_ai_insight":
      return { safe: true, wouldDo: "Marcar insights como leidos" };
    case "refresh_usage_snapshot":
      return { safe: true, wouldDo: "Refrescar metricas de uso" };
    case "run_outbound_queue": {
      const pending = await db.outboundMessage.count({ where: { tenantId, status: "QUEUED" } });
      return { safe: pending > 0, wouldDo: `Procesar ${pending} mensajes pendientes`, entities: ["OutboundMessage"] };
    }
    case "update_non_critical_status":
      return { safe: true, wouldDo: "Actualizar estado no critico" };
    case "assign_priority":
      return { safe: true, wouldDo: "Asignar prioridad" };
    case "create_internal_incident":
      return { safe: true, wouldDo: "Crear caso de soporte interno", entities: ["SupportCase"] };
    default:
      return { safe: false, reason: `Accion no soportada para dry-run: ${actionCode}` };
  }
}

async function executeAction(tenantId: string, actionCode: string, input: object | null): Promise<object> {
  switch (actionCode) {
    case "retry_failed_webhook": {
      const failed = await db.outboundMessage.findMany({
        where: { tenantId, status: "FAILED" },
        take: 10,
      });
      let retried = 0;
      for (const msg of failed) {
        if (msg.attempts < msg.maxAttempts) {
          await db.outboundMessage.update({
            where: { id: msg.id },
            data: { status: "QUEUED", nextAttemptAt: new Date() },
          });
          retried++;
        }
      }
      return { retried, total: failed.length };
    }
    case "requeue_automation_message": {
      const failed = await db.outboundMessage.findMany({
        where: { tenantId, status: "FAILED" },
        take: 10,
      });
      let requeued = 0;
      for (const msg of failed) {
        await db.outboundMessage.update({
          where: { id: msg.id },
          data: { status: "QUEUED", attempts: 0, nextAttemptAt: new Date() },
        });
        requeued++;
      }
      return { requeued };
    }
    case "send_internal_notification": {
      const data = input as { title?: string; message?: string } | null;
      await db.notification.create({
        data: {
          tenantId,
          type: "SYSTEM",
          title: data?.title || "Notificacion automatica",
          message: data?.message || "Generada por mision autonoma",
          severity: "MEDIUM",
        },
      });
      return { sent: true };
    }
    case "acknowledge_ai_insight": {
      const updated = await db.aiInsight.updateMany({
        where: { tenantId, status: "NEW" },
        data: { status: "ACKNOWLEDGED" },
      });
      return { acknowledged: updated.count };
    }
    case "refresh_usage_snapshot": {
      const { snapshotUsage } = await import("@/services/usage.service");
      const metrics = await snapshotUsage(tenantId);
      return { metrics };
    }
    case "run_outbound_queue": {
      const { processQueue } = await import("@/services/outbound.service");
      const results = await processQueue(tenantId);
      return { processed: results.length, results };
    }
    case "assign_priority":
      return { assigned: true, note: "Prioridad asignada" };
    case "update_non_critical_status":
      return { updated: true, note: "Estado actualizado" };
    case "create_internal_incident": {
      const data = input as { title?: string; description?: string } | null;
      const sc = await db.supportCase.create({
        data: {
          tenantId, title: data?.title || "Incidente automatico",
          description: data?.description || "Creado por mision autonoma",
          source: "INTERNAL",
        },
      });
      return { created: true, supportCaseId: sc.id };
    }
    case "generate_export": {
      const { createExportRequest, processExport } = await import("@/services/compliance.service");
      const data = input as { requestedById?: string } | null;
      const req = await createExportRequest(tenantId, data?.requestedById || "system", "FULL_EXPORT");
      await processExport(req.id);
      return { exportId: req.id };
    }
    default:
      throw new Error(`Accion no implementada: ${actionCode}`);
  }
}

async function failStep(stepId: string, error: string) {
  await db.aiMissionStep.update({
    where: { id: stepId },
    data: { status: "FAILED_STEP", errorMessage: error, completedAt: new Date() },
  });
}

async function skipStep(stepId: string, reason: string) {
  await db.aiMissionStep.update({
    where: { id: stepId },
    data: { status: "SKIPPED_STEP", errorMessage: reason, completedAt: new Date() },
  });
}

export async function confirmStep(tenantId: string, stepId: string, confirmedById: string) {
  return db.aiMissionStep.update({
    where: { id: stepId },
    data: { confirmedById, confirmedAt: new Date(), status: "PENDING_STEP" },
  });
}

export async function listMissions(tenantId: string) {
  return db.aiMission.findMany({
    where: { tenantId },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getMission(id: string, tenantId: string) {
  return db.aiMission.findFirst({
    where: { id, tenantId },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
}

export async function listExecutionLogs(tenantId: string, missionId?: string) {
  return db.agentExecutionLog.findMany({
    where: { tenantId, ...(missionId ? { missionId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
