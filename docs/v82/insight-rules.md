# V8.2 — Reglas de Insights Automáticos

Cada regla es un tupla `(agentCode, ruleKey, condition, severity, title, summary)`.
El `ruleKey` funciona como clave de idempotencia: una regla solo existe una vez
en estado abierto (NEW | ACKNOWLEDGED) por tenant.

Severidad:
- `AI_INFO` — informativo, no requiere acción inmediata
- `AI_WARNING` — atención pronto
- `AI_HIGH` — acción hoy
- `AI_CRITICAL` — acción ya

## Treasury (Controller de Tesorería)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `treasury:overdue-expenses` | pagosVencidos >= 1 | HIGH (o CRITICAL si >= 5) | "N pagos vencidos sin liquidar" |
| `treasury:overdue-income` | cobrosVencidos >= 1 | WARNING (HIGH si >= 5) | "N cobros vencidos" |
| `treasury:upcoming-load` | proximos7d >= 10 | INFO | "Alta carga de vencimientos próximos 7 días" |

## Sales (Jefe Comercial)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `sales:negative-margin` | margenNegativo >= 1 | HIGH (CRITICAL si >= 3) | "N pedidos con margen negativo" |
| `sales:stalled-drafts` | borradores >= 10 | WARNING | "Borradores de venta sin cerrar" |

## Purchase (Jefe de Compras)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `purchase:late-orders` | retrasadosMas14d >= 1 | HIGH | "N pedidos de compra retrasados >14d" |
| `purchase:high-partials` | pedidosParciales >= 5 | WARNING | "Pedidos parciales acumulados" |

## Warehouse (Jefe de Almacén)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `warehouse:reception-backlog` | recepcionesPendientes >= 5 | HIGH (CRITICAL si >= 20) | "Backlog de recepciones pendientes" |
| `warehouse:damaged-goods` | productosDañados >= 1 | HIGH | "Mercancía dañada sin cerrar" |
| `warehouse:out-of-stock` | productosSinStock >= 1 | WARNING (HIGH si >= 10) | "N referencias sin stock" |

## Delivery (Jefe de Logística)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `delivery:failed-today` | fallidasHoy >= 1 | HIGH | "N entregas fallidas hoy" |
| `delivery:missing-proofs` | sinPruebaRequerida >= 1 | WARNING | "Entregas entregadas sin prueba requerida" |
| `delivery:high-load-7d` | programadas7d >= 30 | INFO | "Alta carga de entregas próximos 7 días" |

## Billing (Customer Success SaaS) — agente global

Ejecutado para tenants superadmin / billing contexto global.

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `billing:past-due` | tenantsPastDue >= 1 | HIGH (CRITICAL si >= 3) | "Tenants en past_due" |
| `billing:trial-expiring` | trialsProximos14d >= 1 | INFO | "Trials próximos a expirar" |

## Security (CISO)

| ruleKey | condición | severidad | título |
|---------|-----------|-----------|--------|
| `security:critical-events-7d` | eventosCriticos7d >= 1 | CRITICAL | "Eventos críticos de seguridad últimos 7d" |
| `security:locked-accounts` | cuentasBloqueadas >= 1 | WARNING | "Cuentas bloqueadas" |
| `security:failed-logins-24h` | loginsFallidos24h >= 20 | WARNING (HIGH si >= 100) | "Picos de logins fallidos 24h" |

## Executive — consolida

Cuando al menos una regla activa tiene severity >= HIGH:
- `executive:daily-digest` → severity = max(severities subagente), title = "Resumen ejecutivo: N asuntos críticos hoy".
- summary = concatenación corta de los títulos.
- Referencia implícita a insights subyacentes (no fk directa, se usa evidenceJson con array de ids).

## Reglas comunes

- Cada insight se crea con `confidenceScore` = 95 cuando viene de query directa
  (es una lectura de la DB, no una inferencia).
- `evidenceJson` incluye `{ query: "...", count: N, threshold: X }`.
- Si la condición deja de cumplirse en un sweep, el insight se marca `status = RESOLVED_AUTO`.
- El usuario puede `ACKNOWLEDGE` (lo ha visto), `DISMISS` (no le interesa) o esperar
  la resolución automática.
