# V8.2 — Plan de Feedback Loop

## Objetivo

Cerrar el bucle entre lo que el agente dice y cómo de útil resulta,
para que futuras versiones ajusten prompts, personalidades y reglas.

## Modelo (ya existe en schema)

`AiFeedbackSignal`:
- `tenantId`, `agentId`, `userId`
- `conversationId?`, `messageId?`
- `signalType`: `USEFUL | NOT_USEFUL | INCORRECT | TOO_GENERIC | TOO_TECHNICAL | MISSED_RISK`
- `notes?`
- `createdAt`

## Dónde se captura

1. **Chat flotante** (`floating-agent.tsx`)
   - Cada respuesta agente muestra 3 botones + notas opcionales.
   - Se envía messageId (ver abajo).

2. **Cockpit drawer de agente** (`ai-cockpit-client.tsx`)
   - Igual: 3 botones + notas.

3. **Acciones sugeridas**
   - "Rechazar" abre modal con motivo (INCORRECT / TOO_GENERIC / MISSED_RISK).
   - Se guarda como AiFeedbackSignal además del cambio de status.

4. **Insights**
   - "Descartar" acepta nota opcional → AiFeedbackSignal con signalType=NOT_USEFUL.

## messageId

`/api/agent` en V8.2 devuelve:
```json
{ "response": "...", "agentCode": "sales", "messageId": "cmcxxxx", "conversationId": "cmcyyyy" }
```

El cliente usa messageId para asociar el feedback a la fila `AiMessage`.

## Server actions

`src/actions/ai-feedback.actions.ts` ya existe con `recordFeedbackAction`.
V8.2 añade validación con zod y revalida `/ai/cockpit`.

## Agregaciones (sentando las bases, no UI aún)

Consultas soportadas gracias a índice `(tenantId, agentId)`:
- tasa de respuestas útiles por agente
- top-5 preguntas con feedback negativo
- agentes con mayor ratio MISSED_RISK

Se renderizará en V8.3 como panel de métricas.

## Política de no-abuso

- Ratelimit suave (1 feedback cada 2s por usuario) en la server action.
- Nota limitada a 500 caracteres.

## Tests

- `ai-feedback.actions.test.ts` — registra señal con messageId, ratelimit, notas.
- `floating-agent.spec.tsx` (smoke) — feedback buttons aparecen para mensajes agente.
