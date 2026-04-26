# Production Readiness Checklist V7.5 RC

## Auth & Sessions
- [x] NextAuth v4 with JWT, 8h sessions
- [x] bcrypt password hashing (cost 10)
- [x] Password minimum 6 chars
- [x] MFA TOTP available (optional)
- [x] User lockout after 5 failed logins
- [x] Rate limiter on login (in-memory)
- [ ] Rate limiter distributed (Redis) — V8

## Multi-Tenant
- [x] tenantId on all 52 business models
- [x] @@unique compound constraints
- [x] tenantWhere() helper used in all services
- [x] JWT contains tenantId
- [x] Middleware protects all routes
- [x] REPARTO only sees own deliveries (ownership check on detail page)

## Billing SaaS
- [x] 3 plans: Starter, Growth, Pro
- [x] TenantSubscription lifecycle (TRIAL→ACTIVE→PAST_DUE→etc.)
- [x] UsageMetric snapshots
- [x] Limit warnings at 80%
- [x] Restricted mode for impago
- [ ] Stripe webhook integration — V8
- [ ] Real checkout/portal — V8

## Compliance RGPD
- [x] DataExportRequest with FileAsset
- [x] DataDeletionRequest with approval flow
- [x] Customer anonymization (preserves financial records)
- [x] Export expiration 7 days
- [ ] Automated GDPR timer — manual for now

## Security
- [x] MFA TOTP with AES-256-GCM
- [x] 8 recovery codes
- [x] SecurityEvent logging
- [x] User lockout
- [x] Rate limiter (in-memory)
- [ ] Distributed rate limiter — V8
- [ ] IP address capture in SecurityEvent — partial

## Integrations
- [x] Gemini AI (graceful degradation if key missing)
- [x] Email via Resend (graceful degradation)
- [x] WhatsApp optional (graceful degradation)
- [x] GPS ControlGPS (optional)
- [ ] Stripe real — V8

## Storage
- [x] FileAsset for new files
- [x] Attachment legacy for old base64
- [ ] External blob storage (S3/R2) — V8

## Observability
- [x] SystemHealthEvent with severities
- [x] ActivityLog on all critical operations (56 action types)
- [x] BillingEvent with deduplication
- [ ] Sentry/error tracking — not configured
- [ ] Structured logging — console.error only

## Navigation
- [x] 6 groups for JEFE (~26 items, down from ~35)
- [x] 2 groups for ALMACEN (~5 items)
- [x] 2 groups for REPARTO (~3 items)
- [x] Mobile views removed from main sidebar
- [x] Admin marked "(interno)"
- [ ] Admin gated by SUPERADMIN role — V8

## Tenant Demo
- [x] TodoMueble Guardamar seeded
- [x] 3 plans bootstrapped
- [x] Subscription ACTIVE on Starter
- [x] Quick access login (demo only)
