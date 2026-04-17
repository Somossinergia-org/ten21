export type ActionDef = {
  actionCode: string;
  domain: string;
  description: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresConfirmation: boolean;
  allowedAgents: string[];
  idempotent: boolean;
  dryRunSupported: boolean;
  forbiddenInRestrictedMode: boolean;
};

export const ACTION_REGISTRY: ActionDef[] = [
  {
    actionCode: "retry_failed_webhook",
    domain: "automations",
    description: "Reintentar webhook/mensaje fallido de la cola de OutboundMessage",
    riskLevel: "MEDIUM",
    requiresConfirmation: false,
    allowedAgents: ["automations", "support", "orchestrator"],
    idempotent: true,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "requeue_automation_message",
    domain: "automations",
    description: "Reencolar mensaje de automatizacion para reintento",
    riskLevel: "MEDIUM",
    requiresConfirmation: false,
    allowedAgents: ["automations", "support"],
    idempotent: true,
    dryRunSupported: true,
    forbiddenInRestrictedMode: true,
  },
  {
    actionCode: "send_internal_notification",
    domain: "notifications",
    description: "Enviar notificacion interna al tenant",
    riskLevel: "LOW",
    requiresConfirmation: false,
    allowedAgents: ["*"],
    idempotent: false,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "generate_export",
    domain: "compliance",
    description: "Generar exportacion de datos del tenant",
    riskLevel: "HIGH",
    requiresConfirmation: true,
    allowedAgents: ["compliance", "support", "executive"],
    idempotent: false,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "update_non_critical_status",
    domain: "operations",
    description: "Actualizar estado no critico (ej: prioridad de ticket, acknowledge insight)",
    riskLevel: "LOW",
    requiresConfirmation: false,
    allowedAgents: ["postsales", "sales", "purchases", "warehouse", "deliveries", "support"],
    idempotent: true,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "assign_priority",
    domain: "operations",
    description: "Asignar o cambiar prioridad de ticket/insight",
    riskLevel: "LOW",
    requiresConfirmation: false,
    allowedAgents: ["postsales", "support", "executive"],
    idempotent: true,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "create_internal_incident",
    domain: "support",
    description: "Crear caso de soporte interno",
    riskLevel: "MEDIUM",
    requiresConfirmation: false,
    allowedAgents: ["support", "security", "billing", "compliance"],
    idempotent: false,
    dryRunSupported: true,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "acknowledge_ai_insight",
    domain: "ai",
    description: "Marcar un insight IA como leido/procesado",
    riskLevel: "LOW",
    requiresConfirmation: false,
    allowedAgents: ["*"],
    idempotent: true,
    dryRunSupported: false,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "refresh_usage_snapshot",
    domain: "billing",
    description: "Refrescar snapshot de uso del tenant",
    riskLevel: "LOW",
    requiresConfirmation: false,
    allowedAgents: ["billing", "support", "executive"],
    idempotent: true,
    dryRunSupported: false,
    forbiddenInRestrictedMode: false,
  },
  {
    actionCode: "run_outbound_queue",
    domain: "automations",
    description: "Procesar cola de mensajes salientes pendientes",
    riskLevel: "MEDIUM",
    requiresConfirmation: false,
    allowedAgents: ["automations", "support"],
    idempotent: true,
    dryRunSupported: true,
    forbiddenInRestrictedMode: true,
  },
];

export function getAction(code: string): ActionDef | undefined {
  return ACTION_REGISTRY.find((a) => a.actionCode === code);
}

export function canAgentExecute(agentCode: string, actionCode: string): boolean {
  const action = getAction(actionCode);
  if (!action) return false;
  if (action.allowedAgents.includes("*")) return true;
  return action.allowedAgents.includes(agentCode);
}

export function needsConfirmation(actionCode: string): boolean {
  return getAction(actionCode)?.requiresConfirmation ?? true;
}

export function isForbiddenInRestrictedMode(actionCode: string): boolean {
  return getAction(actionCode)?.forbiddenInRestrictedMode ?? false;
}
