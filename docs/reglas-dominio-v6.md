# Reglas de Dominio V6 — SaaS, Onboarding, Observabilidad

## Onboarding de Tenant

### Estados
```
NOT_STARTED -> IN_PROGRESS -> CONFIGURED -> SEEDED -> READY -> LIVE
```

### Checklist Minima para READY
1. TenantConfig completo (nombre, contacto)
2. Al menos 1 usuario JEFE creado
3. Branding basico (al menos appName)
4. Al menos 1 modulo activo
5. Opcionalmente: importacion inicial de productos/proveedores

### Reglas
- Un tenant NO puede acceder a la app normal hasta estado READY o LIVE
- LIVE = operando en produccion con datos reales
- El wizard guarda progreso paso a paso en TenantOnboarding.checklistJson

## Importaciones

### Flujo
```
UPLOADED -> VALIDATING -> READY (preview) -> IMPORTING -> COMPLETED | FAILED | PARTIAL
```

### Reglas
- No importar silenciosamente datos invalidos
- Mostrar preview con errores ANTES de confirmar
- Importar en transaccion: si falla a mitad, rollback
- PARTIAL = algunos registros importados, otros fallaron (con reporte)
- Registrar ImportJob con summaryJson y errorReportJson
- Tipos: PRODUCTS, SUPPLIERS, CUSTOMERS, VEHICLES

## Permisos

### SUPERADMIN (interno)
- Panel /admin completo
- Ver todos los tenants, flags, soporte, salud
- Crear tenants nuevos
- No accede a datos operativos de un tenant directamente

### JEFE (cliente)
- /settings/tenant, /settings/branding, /settings/modules
- /settings/imports
- /onboarding (si su tenant no esta READY)
- NO puede ver /admin ni otros tenants

### ALMACEN / REPARTO
- Sin acceso a settings, onboarding ni admin

## Feature Flags

### Resolucion
1. Buscar FeatureFlag con scope=TENANT y tenantId del usuario
2. Si existe, usar su enabled
3. Si no, buscar scope=GLOBAL con mismo code
4. Si no existe, feature desactivada por defecto

### Reglas
- Solo SUPERADMIN puede crear/editar flags
- ActivityLog en cada cambio de flag
- Flags no borran datos: solo muestran/ocultan funcionalidad

## SystemHealthEvent

### Severidades
- INFO: evento normal registrado para trazabilidad
- WARNING: situacion degradada pero no critica
- ERROR: fallo que requiere atencion
- CRITICAL: fallo que bloquea operacion del tenant

### Categorias
- IMPORT: fallo de importacion
- INTEGRATION: fallo de GPS, email, WhatsApp
- AUTOMATION: cola bloqueada o mensajes fallidos masivos
- AUTH: intentos sospechosos o errores de sesion
- STORAGE: fallo de subida de archivo
- UNKNOWN: sin categoria asignada

### Reglas
- Se genera automaticamente, no manualmente
- CRITICAL genera notificacion interna al SUPERADMIN
- Se puede marcar como resuelto pero no borrar
