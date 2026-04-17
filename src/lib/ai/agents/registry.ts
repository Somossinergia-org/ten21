export type AgentDef = {
  code: string;
  name: string;
  domain: string;
  visibility: "TENANT" | "INTERNAL" | "GLOBAL";
  roles: string[];
  mission: string;
  kpis: string[];
  allowedHandoffs: string[];
};

export const AGENT_REGISTRY: AgentDef[] = [
  { code: "orchestrator", name: "Orquestador", domain: "global", visibility: "TENANT", roles: ["JEFE"], mission: "Enrutar preguntas al especialista correcto", kpis: [], allowedHandoffs: ["*"] },
  { code: "executive", name: "Asistente Ejecutivo", domain: "global", visibility: "TENANT", roles: ["JEFE"], mission: "Resumen diario, prioridades y riesgos del negocio", kpis: ["ventas_pendientes", "cash_forecast", "tickets_abiertos"], allowedHandoffs: ["*"] },
  { code: "sales", name: "Agente de Ventas", domain: "ventas", visibility: "TENANT", roles: ["JEFE"], mission: "Pipeline de ventas, bloqueos, margenes, seguimiento", kpis: ["ventas_draft", "ventas_sin_servir", "margen_medio"], allowedHandoffs: ["customers", "deliveries"] },
  { code: "customers", name: "Agente de Clientes", domain: "clientes", visibility: "TENANT", roles: ["JEFE"], mission: "Perfil 360, riesgo, cobro, calidad de servicio", kpis: ["clientes_activos", "clientes_con_tickets"], allowedHandoffs: ["sales", "postsales"] },
  { code: "purchases", name: "Agente de Compras", domain: "compras", visibility: "TENANT", roles: ["JEFE"], mission: "Pedidos a proveedor, retrasos, calidad", kpis: ["pedidos_pendientes", "fiabilidad_proveedor"], allowedHandoffs: ["warehouse", "inventory"] },
  { code: "warehouse", name: "Agente de Almacen", domain: "almacen", visibility: "TENANT", roles: ["JEFE", "ALMACEN"], mission: "Recepciones, discrepancias, carga del dia", kpis: ["recepciones_hoy", "incidencias_abiertas"], allowedHandoffs: ["purchases", "inventory"] },
  { code: "inventory", name: "Agente de Inventario", domain: "inventario", visibility: "TENANT", roles: ["JEFE", "ALMACEN"], mission: "Stock critico, reservas, movimientos sospechosos", kpis: ["productos_sin_stock", "reservas_tensas"], allowedHandoffs: ["warehouse", "purchases"] },
  { code: "deliveries", name: "Agente de Entregas", domain: "reparto", visibility: "TENANT", roles: ["JEFE", "REPARTO"], mission: "Agenda, riesgo de fallo, saturacion", kpis: ["entregas_hoy", "entregas_fallidas"], allowedHandoffs: ["postsales", "sales"] },
  { code: "finance", name: "Agente Financiero", domain: "finanzas", visibility: "TENANT", roles: ["JEFE"], mission: "Vision cruzada finanzas", kpis: ["balance_previsto", "facturas_vencidas"], allowedHandoffs: ["treasury", "invoices", "profitability"] },
  { code: "treasury", name: "Agente de Tesoreria", domain: "tesoreria", visibility: "TENANT", roles: ["JEFE"], mission: "Caja, vencidos, tension", kpis: ["caja_7d", "pagos_vencidos"], allowedHandoffs: ["finance", "invoices"] },
  { code: "invoices", name: "Agente de Facturacion", domain: "facturacion", visibility: "TENANT", roles: ["JEFE"], mission: "Facturas, discrepancias, cobros", kpis: ["facturas_pendientes", "cobros_vencidos"], allowedHandoffs: ["finance", "treasury"] },
  { code: "profitability", name: "Agente de Rentabilidad", domain: "rentabilidad", visibility: "TENANT", roles: ["JEFE"], mission: "Margenes, riesgo, coste incompleto", kpis: ["margen_negativo_count", "margen_medio_pct"], allowedHandoffs: ["finance", "sales"] },
  { code: "postsales", name: "Agente de Posventa", domain: "posventa", visibility: "TENANT", roles: ["JEFE"], mission: "Tickets, prioridades, clientes reincidentes", kpis: ["tickets_abiertos", "tickets_urgentes"], allowedHandoffs: ["deliveries", "customers"] },
  { code: "automations", name: "Agente de Automatizaciones", domain: "automatizaciones", visibility: "TENANT", roles: ["JEFE"], mission: "Reglas, fallos, cola, optimizacion", kpis: ["mensajes_fallidos", "reglas_activas"], allowedHandoffs: [] },
  { code: "billing", name: "Agente SaaS", domain: "billing", visibility: "INTERNAL", roles: ["JEFE"], mission: "Planes, limites, churn, restricted", kpis: ["tenants_past_due", "trials_expiring"], allowedHandoffs: ["support"] },
  { code: "compliance", name: "Agente RGPD", domain: "compliance", visibility: "INTERNAL", roles: ["JEFE"], mission: "Exportaciones, borrados, trazabilidad", kpis: ["solicitudes_abiertas"], allowedHandoffs: ["support"] },
  { code: "security", name: "Agente de Seguridad", domain: "seguridad", visibility: "INTERNAL", roles: ["JEFE"], mission: "Login fallidos, MFA, rate limit, anomalias", kpis: ["eventos_criticos", "cuentas_bloqueadas"], allowedHandoffs: ["support"] },
  { code: "support", name: "Agente de Soporte", domain: "soporte", visibility: "INTERNAL", roles: ["JEFE"], mission: "Health events, jobs, webhooks, incidentes", kpis: ["health_critical", "jobs_failed"], allowedHandoffs: ["billing", "compliance", "security"] },
];

export function getAgentDef(code: string): AgentDef | undefined {
  return AGENT_REGISTRY.find((a) => a.code === code);
}

export function getAgentsForRole(role: string): AgentDef[] {
  return AGENT_REGISTRY.filter((a) => a.roles.includes(role));
}

export function canHandoff(fromCode: string, toCode: string): boolean {
  const from = getAgentDef(fromCode);
  if (!from) return false;
  if (from.allowedHandoffs.includes("*")) return true;
  return from.allowedHandoffs.includes(toCode);
}
