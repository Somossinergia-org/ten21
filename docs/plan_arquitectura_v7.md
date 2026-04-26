# Plan de Arquitectura V7 — Billing SaaS, Compliance, Seguridad

## Estado V6 Actual
42 modelos, 40+ enums, 137 tests, 11 migraciones.
Ya existe: Tenant con planCode + trialEndsAt, TenantOnboarding, FeatureFlag, SystemHealthEvent.

## Decisiones V7

### TenantSubscription vs Tenant.planCode
- Tenant.planCode queda como CACHE DE LECTURA
- La verdad es TenantSubscription.planId -> SubscriptionPlan.code
- Al cambiar TenantSubscription, actualizar tambien Tenant.planCode (trigger logico)

### Limites Efectivos
1. SubscriptionPlan.limitsJson define limites del plan
2. Se resuelven en cada check via billing-resolver
3. UsageMetric almacena snapshots por periodo (no recalculo on-the-fly)
4. Si usage > limit: mostrar warning, no bloquear automaticamente

### Restricted Mode
Tenant con TenantSubscription.status = PAST_DUE o EXPIRED:
- JEFE puede: login, ver /settings/billing, /settings/compliance, exportar datos
- JEFE NO puede: crear nuevas ventas, confirmar pedidos, activar automatizaciones
- ALMACEN/REPARTO: operacion normal para no bloquear negocio
- Resolver: restricted-mode.ts devuelve { isRestricted, allowedActions }

### Webhook Idempotencia
Todo webhook Stripe:
1. Extraer externalEventId (stripe event.id)
2. Verificar BillingEvent.findFirst por (source, externalEventId)
3. Si existe y processed=true, devolver 200 sin accion
4. Si no existe, crear BillingEvent, procesar, marcar processed=true

### RGPD y Trazabilidad Financiera
- CUSTOMER_DATA: anonimizar Customer (fullName -> "Cliente anonimo", phone -> null, etc.)
- NO borrar CustomerInvoice ni SalesOrder (obligacion fiscal)
- Deliveries anonimizadas pero conservadas
- DataDeletionRequest requiere APPROVED manual antes de ejecutar

### MFA
- TOTP con secreto encriptado (AES-256 usando BACKUP_ENCRYPTION_KEY)
- Recovery codes: 8 codigos hasheados con bcrypt
- Opcional por defecto; obligable via feature flag mfa_required
- Cambio de password requiere MFA si esta habilitado

### Rate Limiting
- Simple in-memory por defecto (bucket por IP + endpoint)
- Endpoints criticos: /login, /api/setup, /api/webhooks/*
- 5 intentos/min en login; lockout 15 min tras 5 fallos

## Orden Implementacion
1. Schema + migration (10 nuevos modelos + extensiones)
2. Zod + bootstrap planes
3. Billing service + subscription lifecycle
4. Usage metrics snapshot
5. Restricted mode resolver
6. Compliance export/deletion
7. MFA service + SecurityEvent
8. Backup/lifecycle admin
9. Tests + deploy
