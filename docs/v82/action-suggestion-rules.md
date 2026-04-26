# V8.2 — Reglas de Acciones Sugeridas

Una acción sugerida es un paso concreto propuesto por un agente para resolver un
insight. Se persiste en `AiActionSuggestion` y se enlaza al insight con
`createdByInsightId`.

## Principios

1. **Una acción = un paso humano claro.** Nunca "revisa todo el sistema".
2. **`requiresConfirmation = true` por defecto.** El sistema no actúa solo en V8.2.
3. **Prioridad alineada con severidad del insight.**
   - INFO → `AI_LOW`
   - WARNING → `AI_NORMAL`
   - HIGH → `AI_HIGH`
   - CRITICAL → `AI_URGENT`
4. **`targetType` nombra la entidad de negocio afectada** para que en V9 se pueda
   lanzar workflow real (ej. TreasuryEntry, PurchaseOrder, SalesOrder).

## Mapa insight → acción

| insight ruleKey | acción título | targetType | recomendación |
|---|---|---|---|
| `treasury:overdue-expenses` | "Priorizar pagos vencidos" | TreasuryEntry | "Revisa los N pagos vencidos y decide orden de liquidación según criticidad del proveedor." |
| `treasury:overdue-income` | "Reclamar cobros vencidos" | TreasuryEntry | "Contacta a los clientes con cobros vencidos. Empieza por importes más altos." |
| `treasury:upcoming-load` | "Revisar proyección de caja 7d" | TreasuryEntry | "Valida que hay caja suficiente para cubrir vencimientos próximos." |
| `sales:negative-margin` | "Auditar pedidos con margen negativo" | SalesOrder | "Revisa las líneas, corrige costes o precios antes de confirmar." |
| `sales:stalled-drafts` | "Cerrar o descartar borradores antiguos" | SalesOrder | "Revisa borradores >30 días y decide cerrarlos o descartarlos." |
| `purchase:late-orders` | "Contactar proveedores retrasados" | PurchaseOrder | "Llama o escribe a proveedores con pedidos >14d sin recibir." |
| `purchase:high-partials` | "Revisar pedidos parciales" | PurchaseOrder | "Confirma si los parciales van a completarse o se cierran." |
| `warehouse:reception-backlog` | "Procesar backlog de recepciones" | Reception | "Organiza equipo para cerrar recepciones pendientes hoy." |
| `warehouse:damaged-goods` | "Cerrar incidencias de daño" | Incident | "Resuelve las incidencias de mercancía dañada abiertas." |
| `warehouse:out-of-stock` | "Reponer referencias sin stock" | Product | "Genera pedido de compra para referencias críticas." |
| `delivery:failed-today` | "Reprogramar entregas fallidas" | Delivery | "Contacta clientes y agenda nueva ventana de entrega." |
| `delivery:missing-proofs` | "Obtener pruebas de entrega pendientes" | Delivery | "Solicita foto o firma a repartidores de entregas ya realizadas." |
| `delivery:high-load-7d` | "Planificar rutas 7d" | Delivery | "Optimiza rutas y verifica disponibilidad de vehículos." |
| `billing:past-due` | "Activar proceso de cobranza SaaS" | TenantSubscription | "Notifica tenants past_due y activa dunning si procede." |
| `billing:trial-expiring` | "Contactar trials próximos a expirar" | TenantSubscription | "Prepara guía de conversión y contacta cada trial." |
| `security:critical-events-7d` | "Revisar eventos críticos de seguridad" | SecurityEvent | "Abre el log de seguridad y clasifica cada evento." |
| `security:locked-accounts` | "Desbloquear cuentas tras revisión" | User | "Valida si las cuentas bloqueadas son legítimas." |
| `security:failed-logins-24h` | "Investigar picos de login fallido" | SecurityEvent | "Identifica origen del pico y aplica bloqueo si procede." |
| `executive:daily-digest` | "Revisar asuntos críticos del día" | AiInsight | "Abre cockpit y revisa cada insight crítico abierto." |

## Idempotencia

Una acción solo se crea si no existe otra con:
- `tenantId`
- `agentId` (mismo agente)
- `targetType`
- `status IN (AI_OPEN, ACCEPTED)`
- `createdByInsightId` (si aplica)

Si existe, se actualiza `updatedAt` para reflejar que la señal sigue activa.

## Ciclo de vida

```
AI_OPEN  -> ACCEPTED  (el jefe acepta; queda pendiente de ejecutar)
AI_OPEN  -> REJECTED  (el jefe descarta; no se vuelve a crear en este ciclo)
ACCEPTED -> DONE      (alguien marca como ejecutada)
AI_OPEN  -> EXPIRED   (pasan X días sin decisión)
```

`REJECTED` con nota opcional alimenta AiFeedbackSignal (TOO_GENERIC, NOT_USEFUL, etc.).
