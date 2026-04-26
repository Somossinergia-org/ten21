# V8.2 Scratchpad — razonamiento paso a paso

Fecha: 2026-04-17
Objetivo: activar de forma real el ciclo cognitivo de los agentes: INSIGHTS -> ACCIONES -> HANDOFFS -> FEEDBACK, con UI que distinga HECHO/INFERENCIA/RECOMENDACION y capture señales de usuario.

## Punto de partida (tras V8.1)

- askAgentCognitive() ya existe y responde con tono por agente.
- buildContextPack() consulta datos reales por dominio.
- AiConversation + AiMessage se persisten en /api/agent.
- Cockpit lee AiInsight/AiActionSuggestion de la DB pero los registros NO se generan solos.
- AiHandoff y AiFeedbackSignal están en schema, no se usan desde UI.
- No hay distinción visual HECHO/INFERENCIA/RECOMENDACION.

## Decisiones arquitectónicas

1. **Generar insights desde señales de negocio, no desde LLM.**
   El LLM es caro y poco determinista; los insights deben nacer de queries sobre datos
   reales (past_due, stock <= 0, retrasos > 14d, entregas fallidas hoy, etc.).
   El LLM solo aporta la redacción del texto cuando el usuario pregunta.
   Llamamos a este bloque `ai-insights.service.ts`.

2. **Idempotencia por (tenantId, agentCode, category, entityType, entityId).**
   Evitar que cada ejecución cree 400 insights iguales. Si existe uno NEW/ACKNOWLEDGED
   con la misma clave → actualizar updatedAt en vez de duplicar.

3. **Un cron ligero que ejecuta `runInsightSweep(tenantId)` cada X min.**
   Aprovechamos el cron ya creado en V7.96 / V7.9x.
   Añadimos endpoint `/api/ai/sweep` autenticado por CRON_SECRET que recorre tenants activos.

4. **Acciones sugeridas (AiActionSuggestion) enlazadas al insight.**
   Cada regla de insight que implica "hazlo tú" produce además una acción con
   requiresConfirmation=true. El jefe o el rol correspondiente la acepta/rechaza.

5. **Handoffs declarativos en registry de reglas.**
   La regla sabe a qué agente hacer handoff. Por ejemplo:
   - sales detecta margen negativo → handoff a treasury.
   - purchase detecta retraso > 14d → handoff a warehouse.
   No lo decide el LLM.

6. **UI cognitiva sin LLM estructurado.**
   En lugar de pedir al LLM que devuelva JSON (frágil), post-procesamos el texto
   plano con un parser simple que reconoce líneas empezando por "HECHO:", "INFERENCIA:",
   "RECOMENDACION:". Los system prompts ya sugieren ese formato; ahora lo reforzamos
   y renderizamos con 3 cajas distintas.

7. **Feedback inline en chat flotante y cockpit drawer.**
   3 botones: Útil / No útil / Incorrecto. Opcionalmente abre una caja de notas.
   Guarda en AiFeedbackSignal con messageId=id del AiMessage agente.

## Plan de ejecución

### Fase A — Docs (esta sesión)
- [x] scratchpad_v82.md
- [ ] insight-rules.md (reglas por agente)
- [ ] action-suggestion-rules.md (acciones por regla)
- [ ] handoff-rules.md (qué dispara qué handoff)
- [ ] ui-cognitive-spec.md (formato HECHO/INFERENCIA/RECOMENDACION)
- [ ] feedback-loop-plan.md (cómo se captura feedback)

### Fase B — Backend
1. `src/services/ai-insights.service.ts`
   - `runInsightSweep(tenantId)` → loopea reglas
   - `createInsightIfNeeded(tenantId, agentCode, key, data)` → idempotente
   - `createActionSuggestionIfNeeded(...)` → idempotente
   - `createHandoffIfNeeded(...)` → idempotente
   - Reglas por agente: executive / sales / purchase / warehouse / delivery / treasury / billing / security.

2. `src/app/api/ai/sweep/route.ts`
   - GET con `x-cron-secret`
   - Llama runInsightSweep por tenant activo.

3. `src/actions/ai-insights.actions.ts`
   - `acceptAction(id)`, `rejectAction(id)`, `acknowledgeInsight(id)`, `dismissInsight(id)`
   - `triggerSweep()` para botón manual desde cockpit (rol JEFE).

4. `src/lib/ai/cognitive-parser.ts`
   - `parseCognitive(text)` → { facts: string[], inferences: string[], recommendations: string[], other: string }

5. Update `askAgentCognitive` prompts a exigir formato con prefijos HECHO:/INFERENCIA:/RECOMENDACION:.

### Fase C — UI
1. `src/components/ai/cognitive-blocks.tsx`
   - `<CognitiveResponse text>` que parsea y pinta 3 bloques con colores distintos.

2. `src/components/ai/feedback-buttons.tsx`
   - 3 botones + textarea opcional. Llama recordFeedbackAction.

3. Update `floating-agent.tsx`:
   - Usa CognitiveResponse en mensajes agente.
   - Añade FeedbackButtons debajo de cada respuesta agente.
   - /api/agent ahora devuelve messageId para poder asociar feedback.

4. Update `ai-cockpit-client.tsx`:
   - Botones por insight: Reconocer / Descartar.
   - Botones por acción: Aceptar / Rechazar.
   - Badge de handoffs activos.
   - Botón "Ejecutar análisis" que llama triggerSweep.
   - Drawer de respuesta usa CognitiveResponse.

### Fase D — Tests
- ai-insights.service.test.ts: idempotencia, reglas por agente.
- cognitive-parser.test.ts: parse de varios formatos.
- ai-feedback.actions.test.ts: registro de señal.

### Fase E — Commit + Deploy

## Reglas concretas de insights (borrador)

- **treasury**: pagosVencidos > 0 → Insight severity=HIGH "N pagos vencidos". Acción: "Priorizar pagos". Si pagosVencidos > 5 → severity=CRITICAL + handoff a executive.
- **treasury**: cobrosVencidos > 0 → WARNING "N cobros pendientes". Acción: "Reclamar cobros". handoff a sales si > 3.
- **warehouse**: recepcionesPendientes > 10 → HIGH "Recepciones acumuladas". Acción: "Revisar backlog".
- **warehouse**: productosSinStock > 0 → WARNING "N referencias sin stock". handoff a purchase.
- **warehouse**: productosDañados > 0 → HIGH "Mercancía dañada sin cerrar". handoff a purchase.
- **sales**: margenNegativo > 0 → HIGH "N ventas con margen negativo". Acción: "Revisar precios". handoff a treasury si > 2.
- **purchase**: retrasadosMas14d > 0 → HIGH "Pedidos retrasados >14d". handoff a warehouse.
- **delivery**: fallidasHoy > 0 → HIGH "Entregas fallidas hoy". handoff a sales.
- **delivery**: sinPruebaRequerida > 0 → WARNING "Entregas sin prueba". handoff a warehouse.
- **billing**: tenantsPastDue > 0 → HIGH (global). Acción: "Activar cobranza".
- **billing**: trialsProximos14d > 0 → INFO. Acción: "Contactar trials".
- **security**: eventosCriticos7d > 0 → CRITICAL. handoff a billing si afecta tenants.
- **security**: cuentasBloqueadas > 0 → WARNING.
- **executive**: agrega señales y genera Insight "Resumen ejecutivo del día" (severity según max de subagentes).

Cada regla se codifica con un "ruleKey" estable: `${agentCode}:${category}`.
El entityType/entityId queda nulo o referencia al conjunto (p.ej. "TreasuryEntry:overdue").

## Parser cognitivo — reglas

- Líneas que empiezan con `HECHO:`, `HECHO 1:`, `• HECHO:`, `- HECHO:`, `**HECHO**:` → facts.
- Análogo para INFERENCIA y RECOMENDACION.
- Si no hay ningún prefijo → todo va a `other` y se renderiza como texto plano.
- Pequeña tolerancia: normalizar acentos y mayúsculas.

## Riesgos

- **Spam de insights**: mitigado por idempotencia + updatedAt.
- **LLM no respeta formato**: fallback al texto plano.
- **Performance del sweep**: indexar por (tenantId, status); máximo 8 reglas * tenants; muy ligero.
- **Feedback sin contexto**: guardamos messageId + agentCode + userId.

## Definition of Done

- [ ] Al entrar al cockpit, existen insights/acciones generados automáticamente según datos del tenant.
- [ ] Un jefe puede aceptar/rechazar una acción y ver el estado cambiar.
- [ ] Al pulsar un agente en cockpit, la respuesta se renderiza con 3 bloques diferenciados.
- [ ] Cada respuesta de agente admite feedback (útil / no útil / incorrecto).
- [ ] Handoffs aparecen como badges con from→to y razón.
- [ ] Tests pasan.
- [ ] Deploy en Vercel ok.
