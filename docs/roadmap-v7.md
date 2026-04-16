# Roadmap V7 — Deuda Tecnica y Futuro

## Fuera de V7

| Item | Motivo |
|------|--------|
| Billing por uso real avanzado | Requiere metering en tiempo real + webhooks usage-based |
| Facturacion electronica fiscal de suscripcion | Requiere integracion AEAT / Facturae |
| SOC2 / ISO 27001 formal | Requiere auditoria externa + controles completos |
| SSO enterprise (SAML/OIDC) | Requiere proveedor IdP |
| Auditoria externa de seguridad | Pentest profesional |
| Backups incrementales avanzados | Sin almacen de binarios gestionado |
| Stripe webhook real | V7 deja estructura preparada, integracion full V8 |
| Impersonation segura de soporte | Requiere flujo completo con audit |

## Deuda Tecnica

| Item | Severidad |
|------|-----------|
| Rate limiter in-memory (no distribuido) | Media — no escala multi-instancia |
| Export sincrono (no async worker) | Media |
| MFA encryption key hardcoded fallback | Baja — env var requerida en prod |
| Sin rol SUPERADMIN diferenciado | Media — JEFE accede a /admin |
| Sin integracion Stripe real | Media |
| Backup solo structure, sin ejecucion real | Media |
| IP address en SecurityEvent no se captura desde request real | Baja |

## Prioridad V8

### Alta
- Integracion real Stripe (customer, checkout, webhooks)
- Rol SUPERADMIN separado de JEFE
- Rate limiter Redis distribuido
- Export async con worker y signed URLs
- MFA obligatorio via feature flag

### Media
- SSO empresarial
- Backups incrementales con S3/R2
- Metering real de uso
- Impersonation con audit completo
- Modelos fiscales 303/349/390

### Baja
- SOC2 formal
- Auditoria externa
- Data warehouse
- BI externo
