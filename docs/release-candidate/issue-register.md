# Issue Register V7.5

## Issues Found

| # | Severity | Module | Issue | Status |
|---|----------|--------|-------|--------|
| 1 | HIGH | Navigation | 35+ sidebar items. Sistema group has 14 items. | FIXING |
| 2 | HIGH | Admin | /admin/* accessible by JEFE, should be SUPERADMIN only | DOCUMENTED (no SUPERADMIN role yet) |
| 3 | MEDIUM | Navigation | Mobile reparto/almacen in wrong sidebar group | FIXING |
| 4 | MEDIUM | Permissions | TenantModule not enforced server-side on page load | DOCUMENTED |
| 5 | MEDIUM | Naming | "Dashboard" vs "Cockpit" unclear distinction | FIXING |
| 6 | LOW | UX | "Fact. proveedor" truncated and ambiguous naming | FIXING |
| 7 | LOW | Data | Delivery.customerName still duplicated alongside Customer entity | KNOWN (backward compat) |
| 8 | LOW | Seed | Setup endpoint still hardcoded to TodoMueble demo data | BY DESIGN (demo tenant) |
