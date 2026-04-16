# Reglas de Dominio — TodoMueble

## Transiciones de Estado

### PurchaseOrder
```
DRAFT → SENT → PARTIAL → RECEIVED → CLOSED
```
- DRAFT→SENT: manual por JEFE
- SENT→PARTIAL: automático al recepcionar parcialmente
- SENT→RECEIVED: automático al recepcionar todo
- PARTIAL→RECEIVED: automático al completar recepciones
- RECEIVED→CLOSED: pendiente de implementar en UI

### Reception
```
PENDING → CHECKING → COMPLETED | WITH_INCIDENTS
```
- En la práctica, se crean directamente como COMPLETED o WITH_INCIDENTS
- PENDING y CHECKING no se usan en el flujo actual

### Incident
```
REGISTERED → NOTIFIED → REVIEWED → CLOSED
```
- Solo avance (sin retroceso)
- CLOSED es terminal
- Cerrar requiere resolución escrita no vacía
- Se registra: reviewedAt, closedAt, closedById

### Delivery
```
PENDING → ASSIGNED → IN_TRANSIT → DELIVERED | FAILED
```
- ASSIGNED: vehículo pasa a IN_USE
- IN_TRANSIT: registra startKm opcional
- DELIVERED/FAILED: registra endKm, vehículo vuelve a AVAILABLE

### Vehicle
```
AVAILABLE ↔ IN_USE (por entregas)
INCIDENT (manual o GPS)
WORKSHOP (manual o GPS)
```
- GPS sync no sobreescribe si hay entrega IN_TRANSIT activa
- Asignar delivery: AVAILABLE → IN_USE
- Completar delivery: IN_USE → AVAILABLE

### SupplierInvoice
```
PENDING → VALIDATED | MISMATCH → PAID
```

### Notification (nuevo V2)
```
UNREAD → READ (al marcar readAt)
```

## Permisos por Rol

### JEFE (admin total)
- Dashboard: lectura completa
- Pedidos: crear, enviar, ver
- Productos: crear, editar, desactivar
- Proveedores: crear, editar, desactivar
- Recepción: crear, ver
- Incidencias: ver, gestionar estados (NOTIFIED→REVIEWED→CLOSED)
- Vehículos: ver, crear, editar, sincronizar GPS
- Entregas: crear, gestionar estados, ver todas
- Clientes: CRUD completo
- Finanzas: todo
- IA: todo
- Usuarios: CRUD
- Estadísticas: ver
- Notificaciones: ver y marcar leídas

### ALMACEN
- Recepción: crear (genera incidencias automáticas)
- Incidencias: ver (solo lectura, no puede cambiar estado)
- Notificaciones: ver las suyas

### REPARTO
- Vehículos: ver lista
- Entregas: crear, iniciar, completar (solo las suyas)
- Calendario: ver sus entregas
- Clientes: lectura mínima (nombre/dirección en contexto de entrega)
- Notificaciones: ver las suyas

## Restricciones Críticas

### Vehículos
- No se puede asignar vehículo con estado IN_USE, INCIDENT o WORKSHOP
- GPS sync salta actualización si vehículo tiene entrega IN_TRANSIT
- Completar entrega devuelve vehículo a AVAILABLE automáticamente

### Incidencias
- Solo se generan automáticamente al crear recepción (V1)
- CLOSED requiere campo resolution no vacío
- Solo JEFE puede transicionar estados

### Multi-Tenant
- TODAS las queries deben incluir tenantId
- Unique constraints compuestos: @@unique([tenantId, field])
- JWT contiene tenantId — no se puede acceder a datos de otro tenant
- Helper tenantWhere() obligatorio

### Adjuntos
- Máximo 2MB por archivo
- Almacenamiento base64 en BD (deuda técnica para V3: storage externo)

### Seguridad
- Contraseñas: bcrypt cost 10, mínimo 6 caracteres
- Sesiones JWT: 8 horas (turno de trabajo)
- RBAC enforced server-side en todas las actions
- /api/setup protegido por secret en query param (deuda técnica)
