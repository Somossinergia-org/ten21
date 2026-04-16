# Release Candidate Report V7.5

## Summary
TodoMueble Guardamar V7.5 is a Release Candidate for the SaaS operational platform
for furniture and appliance stores. It covers the full operational lifecycle from
purchase orders through delivery to post-sales, with financial direction, PWA,
automation engine, billing SaaS, compliance RGPD, and advanced security.

## Stats
- **52 Prisma models**, 55+ enums
- **163 tests** across 20 test files
- **59 pages** in production build
- **12 migrations** (all additive, non-destructive)
- **56 activity actions**, 28 entity types tracked
- **Deploy**: Vercel + Neon PostgreSQL

## Bugs Fixed in V7.5
1. Navigation: reduced from ~35 items to 26 for JEFE (6 clean groups)
2. Mobile reparto/almacen: removed from main sidebar
3. Dashboard renamed to "Inicio" for clarity
4. "Cockpit" renamed to "Cockpit ejecutivo"
5. "Fact. proveedor" merged under Facturas conceptually
6. Admin section marked "(interno)" to distinguish from client panel
7. "Sistema" mega-group eliminated (14 items → split into Finanzas, Automatizacion, Ajustes)

## Known Issues (Documented, Not Blocking)
1. Admin panel accessible by JEFE (no SUPERADMIN role yet) — V8
2. TenantModule not enforced server-side on page load (visual only) — V8
3. Stripe webhook not integrated (structure ready) — V8
4. Rate limiter in-memory (not distributed) — V8
5. Export is synchronous (not async worker) — V8
6. IP address not captured in SecurityEvent from real request — V8
7. Delivery.customerName still duplicated alongside Customer entity — backward compat

## Recommendation
**GO** — with documented limitations. The system is feature-complete for single-
instance deployment with manual billing. Real Stripe integration and SUPERADMIN
role separation are the clear V8 priorities.

## Risk Assessment
- **Low**: Operational modules (compras, recepcion, ventas, entregas) — battle-tested V1-V3
- **Low**: Multi-tenant isolation — enforced at every layer
- **Medium**: Financial modules — V4 implementation, less tested in production
- **Medium**: Billing lifecycle — no real payment provider yet
- **Low**: PWA — manifest present, service worker cache is basic
- **Low**: Automation engine — structure solid, channel providers graceful degrade
