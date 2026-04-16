# Roadmap V6 — Deuda Tecnica y Futuro

## Fuera de V6

| Item | Motivo |
|------|--------|
| Billing SaaS real | Sin pasarela de cobro de suscripcion |
| Impersonation segura de soporte | Requiere auditoria completa de acceso |
| Multi-sede dentro de tenant | Inventario/usuarios por sede |
| Data warehouse / BI externo | Sin ETL ni conectores |
| Onboarding 100% self-service | Requiere documentacion publica y validacion legal |

## Deuda Tecnica

| Item | Severidad |
|------|-----------|
| Adjuntos legacy base64 sin migrar | Media |
| Sin rate limiting | Media |
| Sin 2FA | Baja |
| Worker cola pull-based | Media |
| Service worker solo manifest | Media |
| Panel admin accesible por JEFE | Media — deberia ser SUPERADMIN |
| Sin importacion real de CSV/XLSX | Media — solo estructura preparada |
| Branding solo en config, no aplicado en UI | Media |

## Prioridad V7

### Alta
- Aplicar branding dinamico en sidebar/login desde TenantBranding
- Importaciones reales de CSV/XLSX con preview
- Separar SUPERADMIN de JEFE en permisos
- Service worker con cache offline
- Worker automatico para cola

### Media
- Billing/plan de suscripcion
- Onboarding wizard interactivo
- Data export completo por tenant
- Logs de acceso y auditoria avanzada

### Baja
- Multi-sede
- Impersonation
- BI externo
- 2FA
