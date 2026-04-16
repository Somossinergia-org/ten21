# Plan de Arquitectura V3 — Ventas, Stock Ligero y Posventa

## Estado V2 Actual

### Entidades Existentes (18 modelos)
Tenant, User, Product (con salePrice, category, brand), Supplier (con taxId, terms),
PurchaseOrder + PurchaseOrderLine, Reception + ReceptionLine, Incident,
Vehicle, Delivery (con customerId) + DeliveryLine, Customer,
ActivityLog, Attachment, SupplierInvoice (con reconciliation),
Notification

### Flujos Cerrados
- Compras: PO DRAFT->SENT->PARTIAL->RECEIVED->CLOSED
- Recepcion: comparacion automatica, incidencias auto
- Incidencias: REGISTERED->NOTIFIED->REVIEWED->CLOSED
- Entregas: ASSIGNED->IN_TRANSIT->DELIVERED/FAILED + km + vehiculo
- Clientes: CRUD + historial 360
- Notificaciones: internas con campana
- Finanzas: facturas proveedor + IVA + conciliacion basica

## Nuevas Entidades V3

### SalesOrder
Pedido de venta confirmado por cliente. No es un presupuesto ni un lead.
- Estados: DRAFT -> CONFIRMED -> PARTIALLY_RESERVED -> RESERVED -> IN_DELIVERY -> DELIVERED -> CANCELLED
- Numeracion: VEN-001, VEN-002...
- Relaciones: Customer, SalesOrderLine[], Delivery?, PostSaleTicket[]

### SalesOrderLine
Lineas de una venta con producto, cantidad, precio y coste esperado.
- Permite producto de catalogo o descripcion libre
- Calcula: lineTotal = quantity * unitSalePrice
- Margen estimado = lineTotal - (quantity * unitExpectedCost)

### ProductInventory
Snapshot de stock por producto. Se actualiza por transaccion, no se recalcula.
- onHand: unidades fisicamente en almacen
- reserved: unidades comprometidas por ventas confirmadas
- available = onHand - reserved

### StockMovement
Registro inmutable de cada movimiento de stock.
- Tipos: RECEPTION_IN, SALE_RESERVE, SALE_RELEASE, DELIVERY_OUT, MANUAL_ADJUSTMENT
- Siempre referencia a origen (receptionId, salesOrderId, deliveryId, etc.)

### PostSaleTicket
Incidencia postventa vinculada a cliente, venta o entrega.
- Tipos: DAMAGE, MISSING_ITEM, INSTALLATION, WARRANTY, RETURN, OTHER
- Prioridad: LOW, NORMAL, HIGH, URGENT
- Estados: OPEN -> IN_PROGRESS -> WAITING_SUPPLIER -> RESOLVED -> CLOSED
- Numeracion: SAT-001, SAT-002...

## Dependencias entre Entidades V3

```
Customer --(1:N)--> SalesOrder --(1:N)--> SalesOrderLine --(N:1)--> Product
                                                                       |
Product --(1:1)--> ProductInventory <--(N:1)-- StockMovement           |
                                                                       |
SalesOrder --(0:1)--> Delivery --(1:N)--> DeliveryLine --(N:1)--> Product
                                                                       
Customer --(1:N)--> PostSaleTicket
SalesOrder --(0:N)--> PostSaleTicket
Delivery --(0:N)--> PostSaleTicket
```

## Flujo de Stock

```
RECEPTION_IN: Reception completada -> +onHand, +available
SALE_RESERVE: Venta confirmada -> +reserved, -available
SALE_RELEASE: Venta cancelada -> -reserved, +available
DELIVERY_OUT: Entrega completada -> -onHand, -reserved
MANUAL_ADJUSTMENT: Ajuste JEFE -> +/- onHand, recalcular available
```

## Riesgos

1. **Stock negativo**: Evitar con validacion en transaccion. Si available < 0 tras reserva, marcar PARTIALLY_RESERVED.
2. **Doble salida**: Delivery ya completada no puede generar otro DELIVERY_OUT. Validar en transaccion.
3. **Cancelacion con reserva**: Liberar SALE_RELEASE antes de cancelar.
4. **Recepciones dañadas**: Solo sumar quantityReceived - quantityDamaged al stock.

## Orden de Implementacion

1. Schema Prisma + migracion
2. Zod schemas + servicios vacios
3. Sales Orders CRUD + confirmacion
4. ProductInventory + StockMovement + integracion recepcion
5. Reserva de stock al confirmar venta
6. Delivery desde venta + DELIVERY_OUT
7. PostSaleTicket CRUD
8. Dashboard + busqueda + IA
