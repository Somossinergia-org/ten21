# V8 Plan — Real Integrations and Truth Cleanup

## Decisions

### Billing
**Decision: HONEST MANUAL MODE**. We don't have Stripe credentials. The existing BillingProvider enum already has MANUAL value. We will:
- Remove any UI copy that claims "automatic billing"
- Stripe webhook scaffolding stays but clearly marked as "pending real integration"
- Manual invoice creation is the current truth

### Outbound Queue
**Decision: Cron endpoint + manual fallback**. Create `/api/cron/process-outbound` protected by `CRON_SECRET`. Vercel Cron can call it every 5 min.

### Export/Compliance
**Decision: Keep synchronous for now**. Volume is low. Document as V8.5 deferral.

### Dual-truth Cleanup
**Decision: Start soft deprecation**. Mark Delivery.customer* as deprecated in comments + `resolveCustomer()` helper that prefers Customer entity. No data migration in V8.

### Routes to eliminate
- `/settings/ai` — delete, keep `/ai/cockpit` only
- `/onboarding` — remove from middleware, directory already empty
- `/settings/finance` — rename conceptually; keep for supplier invoices (admin context)

### Branding
**Decision: Dynamic in layout**. Fetch TenantBranding server-side in layout, pass to Sidebar. Fallback to "TodoMueble" if missing.

### Tests
**Decision: Add 5 integration tests** that hit real Prisma (no mocks) for:
1. Reception creates incidents
2. Sales confirm reserves stock
3. Delivery completes decrements stock
4. Agent registry filtering by role
5. MissionStep confirmation flow

## Out of V8 (deferred to V8.5)
- Real Stripe integration
- Playwright E2E (needs browser infra)
- Full Delivery.customer* data migration
- TenantTemplate implementation
- Import parser
