# V8.2 — Reglas de Handoffs

Un handoff es una derivación explícita entre dos agentes cuando un hallazgo
rebasa el dominio del agente que lo detectó. Se persiste en `AiHandoff`
(`fromAgentId`, `toAgentId`, `reason`, `payloadJson`, `urgency`).

## Por qué

El orquestador (V7.95) no ejecuta LLM reactivo en runtime; usamos reglas
declarativas: la regla sabe a qué especialista mover.

## Tabla de handoffs

| Origen | Disparador | Destino | Urgencia | Razón |
|--------|------------|---------|----------|-------|
| treasury | overdue-expenses CRITICAL (>=5) | executive | URGENT | "Riesgo de tesorería crítico, requiere decisión ejecutiva" |
| treasury | overdue-income HIGH (>=5) | sales | HIGH | "Cobros vencidos requieren gestión comercial" |
| sales | negative-margin CRITICAL (>=3) | treasury | HIGH | "Impacto en caja por margen negativo" |
| purchase | late-orders HIGH | warehouse | NORMAL | "Almacén debe planear entrada tardía" |
| warehouse | out-of-stock HIGH (>=10) | purchase | HIGH | "Reposición urgente" |
| warehouse | damaged-goods HIGH | purchase | NORMAL | "Reclamar al proveedor" |
| delivery | failed-today HIGH | sales | NORMAL | "Comercial debe reagendar con el cliente" |
| delivery | missing-proofs | warehouse | LOW | "Registrar prueba de entrega" |
| billing | past-due CRITICAL | security | NORMAL | "Posible fraude o actividad anómala" |
| security | critical-events | billing | HIGH | "Afecta a tenants, revisar planes" |

## Idempotencia

Un handoff solo se crea si no existe ya uno abierto
(`status IN (HANDOFF_CREATED, HANDOFF_READ, HANDOFF_IN_PROGRESS)`) con:
- mismo `tenantId`
- mismo `fromAgentId` + `toAgentId`
- mismo `reason`

Se actualiza `updatedAt` si se sigue cumpliendo la condición.

## Estados

```
HANDOFF_CREATED   -> HANDOFF_READ     (el agente destino lo ha visto)
HANDOFF_READ      -> HANDOFF_DONE     (resuelto)
HANDOFF_CREATED   -> HANDOFF_CLOSED   (descartado manualmente)
```

## payloadJson

Incluye:
```json
{
  "insightId": "...",
  "metric": "productosSinStock",
  "value": 12,
  "threshold": 10
}
```

## UI

- Cockpit: badge "Handoff activo" en el agente destino con tooltip que indica de
  qué agente viene y la razón.
- Floating chat: si el agente tiene handoffs entrantes, aparece chip "Tienes N
  avisos de otros agentes" arriba del chat.
