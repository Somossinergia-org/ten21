# Plan de Arquitectura V5 — PWA, Automatizaciones, Omnicanal

## Estado V4 Actual
27 modelos Prisma, 23 enums, 113 tests, 9 migraciones.
Flujos cerrados: compras, recepcion, stock, ventas, entregas, posventa,
facturacion cliente, tesoreria, rentabilidad, cockpit ejecutivo.

## Decisiones de Diseño V5

### FileAsset vs Attachment legacy
- Attachment legacy (base64 en BD) se mantiene en lectura. No se migra.
- Todo archivo nuevo binario va a FileAsset con storage externo (Vercel Blob o similar).
- En este MVP, FileAsset almacena URL publica. El storage real depende del provider configurado.
- Si no hay provider configurado, fallback a base64 en FileAsset.publicUrl (data URL).

### Idempotencia del sync offline
- Cada operacion offline lleva un clientRequestId (UUID generado en cliente).
- El servidor verifica si ya existe un registro con ese requestId antes de procesar.
- Si ya existe, devuelve el resultado existente sin duplicar.
- Esto aplica a: transiciones de estado, pruebas de entrega, km tracking.

### Evitar duplicados de OutboundMessage
- Al disparar un evento, se busca si ya existe un OutboundMessage con mismo
  (eventType, sourceType, sourceId, channel, targetId) en los ultimos 5 minutos.
- Si existe, no se duplica.

### Eventos que disparan automatizaciones V5
- DELIVERY_ASSIGNED: al asignar vehiculo+repartidor
- DELIVERY_IN_TRANSIT: al iniciar entrega
- DELIVERY_FAILED: al marcar fallida
- DELIVERY_DELIVERED: al completar
- POST_SALE_URGENT: al crear ticket HIGH/URGENT
- INVOICE_OVERDUE: al detectar factura vencida (check periodico)

### Endpoints moviles - proteccion
- Todos requieren sesion NextAuth valida
- REPARTO: solo sus entregas, sus proofs
- ALMACEN: solo recepciones de su tenant
- Rate limiting: pendiente V6 (deuda tecnica documentada)

## Flujo Delivery -> Proof -> Outbound
```
1. REPARTO abre entrega en movil (PWA)
2. Inicia entrega (IN_TRANSIT, registra startKm)
3. Llega al cliente
4. Captura proof: foto, firma, nota, GPS
5. Marca DELIVERED (con endKm)
6. Sistema genera DELIVERY_OUT (stock)
7. Sistema busca AutomationRule para DELIVERY_DELIVERED
8. Si hay regla activa con canal EMAIL/WHATSAPP para CUSTOMER:
   - Verifica consentimiento
   - Crea OutboundMessage QUEUED
   - Worker procesa: envia por provider
   - Si falla: retry hasta 3 veces
   - Si exito: marca SENT
9. ActivityLog registra todo
```

## Orden de Implementacion
1. Schema + migration (FileAsset, DeliveryProof, DeviceSubscription, etc.)
2. Zod + storage provider + placeholders
3. FileAsset + DeliveryProof service + UI movil proof
4. PWA manifest + service worker
5. Mobile reparto interface
6. Mobile almacen interface
7. NotificationTemplate + AutomationRule CRUD
8. OutboundMessage queue + worker
9. Channel providers (push, email, whatsapp adapter)
10. Event dispatchers wired into existing actions
11. Automations panel
12. Cockpit integration
