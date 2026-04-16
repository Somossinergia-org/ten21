# Reglas de Dominio V7 — Billing, Compliance, Seguridad

## Lifecycle de Suscripcion

```
TRIAL -> ACTIVE (pago confirmado)
TRIAL -> EXPIRED (fin de trial sin pago)
ACTIVE -> PAST_DUE (pago fallido)
ACTIVE -> CANCELLED (cancelAtPeriodEnd=true al cierre de periodo)
ACTIVE -> PAUSED (pausa manual)
PAUSED -> ACTIVE (reactivacion)
PAST_DUE -> ACTIVE (pago exitoso)
PAST_DUE -> EXPIRED (fin de gracia)
```

## Restricted Mode

### Condiciones
- Tenant con TenantSubscription.status ∈ {PAST_DUE, EXPIRED, CANCELLED}

### Permitido en modo restringido
- Login de JEFE
- Acceso a /settings/billing
- Acceso a /settings/compliance (exportar)
- Ver dashboards de solo lectura
- Contacto soporte

### Restringido en modo restringido
- Crear SalesOrder
- Confirmar SalesOrder
- Crear nuevas automation rules
- Enviar OutboundMessage masivos
- Crear usuarios adicionales

### Bypass ADMIN
- Rol ADMIN interno (futuro) o flag admin_bypass_restrictions puede entrar normal

## Compliance RGPD

### DataExportRequest
- JEFE solicita
- Procesado asincronamente -> FileAsset seguro
- Enlace expira en 7 dias
- Un tenant solo puede tener 1 export activo a la vez

### DataDeletionRequest
- JEFE solicita CUSTOMER_DATA o TENANT_DATA
- Requiere APPROVED por ADMIN interno o auto-approve si CUSTOMER_DATA
- Anonimiza en lugar de borrar:
  - Customer: fullName='[Anonimizado]', phone=null, email=null, address=''
  - Preserva: CustomerInvoice, SalesOrder, Delivery (por obligacion fiscal)

## MFA TOTP

### Flujo
1. JEFE en /settings/security -> "Activar MFA"
2. Servidor genera secreto, devuelve QR
3. Usuario escanea con Google Authenticator
4. Usuario introduce codigo 6 digitos
5. Si valido, UserMfa.enabled=true, se generan 8 recovery codes
6. Desde entonces, login requiere TOTP

### Reglas
- Recovery codes single-use
- Desactivar MFA requiere: password + TOTP actual
- ADMIN puede resetear MFA de un usuario si hay perdida de dispositivo

## Security Events

| Type | Severity | Trigger |
|------|----------|---------|
| LOGIN_FAILED | WARNING | Password incorrecto |
| LOGIN_FAILED (x5) | HIGH | 5 fallos seguidos -> lockout |
| PASSWORD_CHANGED | INFO | Cambio voluntario |
| MFA_ENABLED | INFO | Activacion MFA |
| MFA_DISABLED | WARNING | Desactivacion MFA |
| SESSION_REVOKED | INFO | Logout forzado |
| RATE_LIMIT_HIT | WARNING | Endpoint rate-limited |
| ADMIN_ACCESS | INFO | Acceso a /admin |
| SUSPICIOUS_ACTIVITY | CRITICAL | Patron anomalo detectado |

## User Lockout

- failedLoginCount >= 5 -> lockedUntil = now + 15 min
- Login correcto resetea failedLoginCount = 0
- lockedUntil > now bloquea login incluso con password correcto
- ADMIN puede desbloquear manualmente

## Permisos V7

### JEFE
- /settings/billing: ver plan, facturas, cambiar plan
- /settings/compliance: exportar, solicitar borrado
- /settings/security: MFA personal

### ADMIN interno (via panel /admin)
- /admin/billing: todos los tenants, impagos, trials
- /admin/compliance: aprobar solicitudes RGPD
- /admin/security: SecurityEvents, desbloquear usuarios
- /admin/lifecycle: tenants suspendidos, trials vencidos, backups

### ALMACEN/REPARTO
- Sin acceso a V7 endpoints
