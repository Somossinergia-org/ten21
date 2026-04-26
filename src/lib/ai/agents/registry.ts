export type AgentDef = {
  code: string;
  name: string;
  domain: string;
  visibility: "TENANT" | "INTERNAL" | "GLOBAL";
  roles: string[];
  mission: string;
  kpis: string[];
  allowedHandoffs: string[];
  active: boolean;
};

// V7.95: Reduced from 18 to 8 visible agents + 1 internal orchestrator
export const AGENT_REGISTRY: AgentDef[] = [
  // Internal orchestrator — not visible in UI
  { code: "orchestrator", name: "Orquestador", domain: "global", visibility: "INTERNAL", roles: [], mission: "Enrutar preguntas al especialista correcto", kpis: [], allowedHandoffs: ["*"], active: true },

  // 8 visible agents
  { code: "executive", name: "Asistente Ejecutivo", domain: "global", visibility: "TENANT", roles: ["JEFE"], mission: "Resumen diario, prioridades, riesgos y plan de accion del negocio", kpis: ["ventas_pendientes", "cash_forecast", "tickets_abiertos", "entregas_fallidas"], allowedHandoffs: ["sales", "purchase", "warehouse", "delivery", "treasury"], active: true },
  { code: "sales", name: "Agente de Ventas", domain: "ventas", visibility: "TENANT", roles: ["JEFE"], mission: "Pipeline de ventas, bloqueos, margenes dudosos, seguimiento pendiente", kpis: ["ventas_draft", "ventas_sin_servir", "margen_medio"], allowedHandoffs: ["delivery", "treasury"], active: true },
  { code: "purchase", name: "Agente de Compras", domain: "compras", visibility: "TENANT", roles: ["JEFE"], mission: "Pedidos a proveedor, parciales, retrasos, desviaciones, fiabilidad", kpis: ["pedidos_pendientes", "fiabilidad_proveedor"], allowedHandoffs: ["warehouse"], active: true },
  { code: "warehouse", name: "Agente de Almacen", domain: "almacen", visibility: "TENANT", roles: ["JEFE", "ALMACEN"], mission: "Recepciones, discrepancias, danos, stock critico, carga del dia", kpis: ["recepciones_hoy", "incidencias_abiertas", "productos_sin_stock"], allowedHandoffs: ["purchase"], active: true },
  { code: "delivery", name: "Agente de Entregas", domain: "reparto", visibility: "TENANT", roles: ["JEFE", "REPARTO"], mission: "Agenda de reparto, riesgo de fallo, pruebas de entrega, carga vehiculos", kpis: ["entregas_hoy", "entregas_fallidas", "entregas_activas"], allowedHandoffs: ["sales"], active: true },
  { code: "treasury", name: "Agente de Tesoreria", domain: "tesoreria", visibility: "TENANT", roles: ["JEFE"], mission: "Vencidos, tension de caja, proximos pagos/cobros, priorizacion", kpis: ["caja_7d", "pagos_vencidos", "cobros_vencidos"], allowedHandoffs: ["sales"], active: true },
  { code: "billing", name: "Agente SaaS", domain: "billing", visibility: "INTERNAL", roles: ["JEFE"], mission: "Trials, past_due, limites, restricted mode, churn", kpis: ["tenants_past_due", "trials_expiring"], allowedHandoffs: [], active: true },
  { code: "security", name: "Agente de Seguridad", domain: "seguridad", visibility: "INTERNAL", roles: ["JEFE"], mission: "Login fallidos, MFA, rate limit, eventos de riesgo", kpis: ["eventos_criticos", "cuentas_bloqueadas"], allowedHandoffs: [], active: true },
];

export function getAgentDef(code: string): AgentDef | undefined {
  return AGENT_REGISTRY.find((a) => a.code === code);
}

export function getVisibleAgents(role: string, isSuperAdmin: boolean): AgentDef[] {
  return AGENT_REGISTRY.filter((a) => {
    if (!a.active) return false;
    if (a.visibility === "INTERNAL" && !isSuperAdmin) return false;
    if (a.code === "orchestrator") return false;
    return a.roles.includes(role);
  });
}

export function canHandoff(fromCode: string, toCode: string): boolean {
  const from = getAgentDef(fromCode);
  if (!from) return false;
  if (from.allowedHandoffs.includes("*")) return true;
  return from.allowedHandoffs.includes(toCode);
}
