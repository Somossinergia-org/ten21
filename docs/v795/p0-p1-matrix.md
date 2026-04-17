# V7.95 P0-P1 Fix Matrix

## P0 — Must fix before anything

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | MFA not enforced | auth.ts:42-72 | Check UserMfa.enabled, reject if no TOTP code |
| 2 | Rate limiter dead | security.service.ts | Call checkRateLimit in auth + setup endpoints |
| 3 | confirmStep insecure | mission.service.ts:339 | Add requireRole, tenantId check, state check |
| 4 | SETUP_SECRET fallback | setup/route.ts:5 | Remove fallback, require env var |
| 5 | Admin visible to JEFE | sidebar.tsx | Gate with isSuperAdmin check |
| 6 | Force-reset incomplete | setup/route.ts:28-84 | Add 23 V7.7-V7.9 tables |
| 7 | No tenant creation API | N/A | Create /api/admin/provision-tenant |

## P1 — Fix in this release

| # | Issue | Fix |
|---|-------|-----|
| 8 | 12 shell agents visible | Reduce registry to 8+orchestrator |
| 9 | /onboarding phantom | Delete middleware entry |
| 10 | /settings/ai orphan | Remove page |
| 11 | Branding hardcoded | Read TenantBranding in sidebar |
