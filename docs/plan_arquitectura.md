# Plan de Arquitectura — TodoMueble V2

## Estado Actual del Sistema

### Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **ORM**: Prisma 5 + PostgreSQL 16
- **Auth**: NextAuth v4, JWT (8h), bcrypt
- **UI**: Tailwind CSS, Recharts, FullCalendar, Framer Motion
- **IA**: Google Gemini 2.5 Flash
- **Deploy**: Vercel + Neon PostgreSQL

### Dominios Existentes (V1)

| Dominio | Modelos | Estado |
|---------|---------|--------|
| Tenants | Tenant | Completo |
| Usuarios | User (3 roles) | Completo |
| Productos | Product | Parcial (sin precio venta, sin categoría, sin stock) |
| Proveedores | Supplier | Parcial (sin CIF, sin condiciones) |
| Pedidos | PurchaseOrder, PurchaseOrderLine | Completo |
| Recepción | Reception, ReceptionLine | Completo (core MVP) |
| Incidencias | Incident | Completo |
| Vehículos | Vehicle | Parcial (sin CRUD UI, sin mantenimiento) |
| Entregas | Delivery | Completo pero sin entidad Cliente ni líneas |
| Finanzas | SupplierInvoice | Completo pero sin conciliación PO |
| Auditoría | ActivityLog | Completo |
| Adjuntos | Attachment | Completo |
| IA | Gemini chat/briefing/anomalías/extracción | Completo |

### Dependencias entre Entidades

```
Tenant ──┬── User ──┬── PurchaseOrder ── PurchaseOrderLine ── Product
         │          ├── Reception ── ReceptionLine ── PurchaseOrderLine
         │          ├── Incident ── Reception
         │          └── Delivery ── Vehicle
         ├── Product
         ├── Supplier ── PurchaseOrder
         ├── Vehicle
         ├── SupplierInvoice
         ├── ActivityLog
         └── Attachment
```

## Cambios V2

### Nuevas Entidades

#### Customer
- Centraliza datos de cliente que hoy están sueltos en Delivery
- Relación 1:N con Delivery (un cliente, muchas entregas)
- Campos: fullName, phone, email, addressLine1/2, city, postalCode, province, notes, active

#### DeliveryLine
- Vincula productos concretos a entregas
- Relación N:1 con Delivery, N:1 con Product (opcional)
- Campos: description, quantity, notes
- Permite líneas manuales (sin productId) o vinculadas a catálogo

#### Notification
- Backend real para la campana del header
- Vinculable a cualquier entidad (entityType + entityId)
- Campos: type, title, message, severity, readAt
- Disparadores iniciales: nueva incidencia, entrega fallida, pedido parcial, factura discrepante

### Extensiones de Entidades Existentes

#### Product (campos nuevos)
- `salePrice`: Decimal nullable — precio de venta al público
- `category`: String nullable — familia/categoría (texto libre inicialmente)
- `brand`: String nullable — marca del producto

#### Supplier (campos nuevos)
- `taxId`: String nullable — CIF/NIF
- `commercialTerms`: String nullable — condiciones comerciales
- `paymentTerms`: String nullable — condiciones de pago
- `notes`: String nullable

#### SupplierInvoice (campos nuevos)
- `purchaseOrderId`: ya existe como nullable, sin relación formal → añadir relación
- `mismatchReason`: String nullable — motivo de discrepancia
- `reconciliationStatus`: Enum nullable (NOT_CHECKED, MATCHED, MISMATCHED)

#### Delivery (campos nuevos)
- `customerId`: String nullable — FK a Customer
- Se mantienen customerName/Phone/Address temporalmente para compatibilidad

### Riesgos de Migración

1. **Customer backfill**: Las deliveries existentes tienen datos de cliente como strings sueltos. El backfill debe agrupar por (tenantId + customerName + customerAddress) para crear Customers sin duplicados, pero puede haber variaciones en nombres/direcciones.
   - **Mitigación**: backfill conservador — solo agrupa coincidencias exactas. No deduplica variaciones.
   - **Fallback**: deliveries sin customerId siguen funcionando (campo nullable).

2. **DeliveryLine**: Las deliveries existentes solo tienen `description` como texto libre. No hay migración automática posible.
   - **Mitigación**: las DeliveryLines son opcionales en V2. El campo `description` original se mantiene.

3. **SupplierInvoice.purchaseOrderId**: ya existe como campo string nullable pero sin relación Prisma formal.
   - **Mitigación**: añadir relación opcional, no rompe datos existentes.

### Estrategia de Compatibilidad

- Todos los campos nuevos son **nullable** o tienen **defaults**
- Migraciones 100% aditivas (no se eliminan columnas ni se cambian tipos)
- UI muestra fallback si Customer no está vinculado
- DeliveryLine es complementario a `description`, no lo reemplaza todavía

### Orden de Implementación

1. Schema Prisma: Customer, DeliveryLine, Notification + campos nuevos
2. Migración incremental
3. Backfill Delivery→Customer
4. Validaciones Zod
5. Services + Actions
6. UI: Customers CRUD → Delivery refactor → Master CRUD → Notifications → Conciliación
