# Reglas de Dominio V5 — PWA, Automatizaciones, Omnicanal

## Permisos Moviles por Rol

### REPARTO (PWA)
- Ver sus entregas del dia
- Iniciar entrega (startKm)
- Completar entrega (endKm, proof)
- Marcar fallida (reason)
- Capturar proof: foto, firma, nota, GPS
- Ver datos minimos de cliente (nombre, telefono, direccion)
- NO puede ver finanzas, ventas, inventario ni automatizaciones

### ALMACEN (PWA)
- Ver recepciones pendientes
- Acceso rapido a chequeo e incidencias
- NO puede modificar stock manualmente (solo JEFE)

### JEFE
- Automatizaciones: CRUD completo
- Plantillas: CRUD completo
- Cola de mensajes: ver, reintentar, cancelar
- Panel operativo completo

## Prueba de Entrega (DeliveryProof)

### Tipos
- PHOTO: foto del paquete entregado o del portal
- SIGNATURE: firma digital del cliente (canvas)
- GPS_SNAPSHOT: coordenadas automaticas
- NOTE: nota escrita

### Reglas
- Si Delivery.proofRequired=true, al menos 1 proof es obligatoria para marcar DELIVERED
- Si proofRequired=false, proofs son opcionales
- Proofs se vinculan a FileAsset para archivos binarios
- Proofs son inmutables (no se editan, no se borran)

## Consentimiento por Canal

### Customer fields
- allowEmail: puede recibir email
- allowWhatsApp: puede recibir WhatsApp
- allowPush: no aplica (push es para usuarios internos)

### Reglas
- Si Customer.allowEmail=false, no enviar EMAIL al cliente
- Si Customer.allowWhatsApp=false, no enviar WHATSAPP al cliente
- Push es solo para usuarios internos (DeviceSubscription)
- Todo envio deja registro en OutboundMessage

## OutboundMessage - Estados y Reintentos

```
QUEUED -> PROCESSING -> SENT (exito)
                     -> FAILED (fallo)
FAILED -> QUEUED (reintento manual o automatico, max 3)
QUEUED -> CANCELLED (cancelacion manual)
```

### Reglas
- maxAttempts=3 por defecto
- Si attempts >= maxAttempts y falla, queda FAILED permanente
- FAILED genera notificacion interna al JEFE si es critico
- nextAttemptAt = now + (attempts * 60 seconds) backoff simple
- lastError almacena el mensaje del ultimo fallo

## AutomationRule

### Event Types Soportados
- DELIVERY_ASSIGNED
- DELIVERY_IN_TRANSIT
- DELIVERY_FAILED
- DELIVERY_DELIVERED
- POST_SALE_URGENT
- INVOICE_OVERDUE

### Targets
- USER: envia a usuario interno (push)
- CUSTOMER: envia a cliente (email/whatsapp)
- ROLE: envia a todos los usuarios de un rol (push)

### Reglas
- Solo JEFE puede crear/editar/pausar reglas
- Regla deshabilitada (enabled=false) no dispara
- conditionsJson: filtros opcionales (ej: solo si priority=URGENT)
