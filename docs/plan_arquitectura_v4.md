# Plan de Arquitectura V4 — Tesoreria, Rentabilidad y Direccion Ejecutiva

## Estado V3 Actual

### Entidades (24 modelos, 18 enums)
Ya existen: Tenant, User, Product (con salePrice, defaultCost, brand, category), Supplier,
PurchaseOrder+Lines, Reception+Lines, Incident, Vehicle, Delivery+DeliveryLine, Customer,
SalesOrder+SalesOrderLine, ProductInventory, StockMovement, PostSaleTicket,
ActivityLog, Attachment, SupplierInvoice (con reconciliation), Notification

### Flujos Cerrados
- Compras -> Recepcion -> Incidencias automaticas -> Stock (RECEPTION_IN)
- Ventas -> Reserva stock -> Entrega -> Stock (DELIVERY_OUT) -> Posventa
- Facturas proveedor con conciliacion basica vs PurchaseOrder
- Notificaciones internas
- IA contextual

### Lo que FALTA (V4)
- Facturacion a cliente (CustomerInvoice)
- Tesoreria (pagos esperados, cobros esperados, forecast)
- Rentabilidad real (margen estimado vs real)
- Cockpit ejecutivo del jefe

## Diseño V4

### Snapshot Monetario
Los precios en SalesOrderLine y CustomerInvoiceLine son snapshots congelados al momento de creacion. Editar Product.salePrice NO cambia lineas ya creadas. Esto preserva el historico.

### Margen Estimado vs Real
- **Estimado** = SalesOrderLine.unitSalePrice - SalesOrderLine.unitExpectedCost (ya capturado en V3)
- **Real** = SalesOrderLine.unitSalePrice - coste real servido
- Coste real: se toma de PurchaseOrderLine.expectedUnitCost de la recepcion vinculada, o de SupplierInvoice si esta validada
- Si no hay dato fiable, marcar como "margen incompleto"
- SalesOrder.realMargin se calcula al entregar y se congela

### Tesoreria
- TreasuryEntry agrupa pagos y cobros en una sola tabla
- Se genera automaticamente desde:
  - SupplierInvoice validada/pendiente -> EXPENSE_EXPECTED/CONFIRMED
  - CustomerInvoice emitida -> INCOME_EXPECTED
  - CustomerInvoice cobrada -> INCOME_CONFIRMED
  - Entradas manuales del JEFE
- Forecast = sum(entries WHERE dueDate BETWEEN now AND now+N days) agrupado por tipo

### CustomerInvoice
- Se crea desde SalesOrder (arrastra cliente + lineas)
- FACC-001, FACC-002...
- Estados: DRAFT -> ISSUED -> PARTIALLY_PAID -> PAID | OVERDUE | CANCELLED
- Al emitir -> TreasuryEntry INCOME_EXPECTED
- Al cobrar -> TreasuryEntry INCOME_CONFIRMED

### Cockpit Ejecutivo
Responde en 10 segundos:
- Cuanto debo pagar? (pagos proximos y vencidos)
- Cuanto espero cobrar? (cobros proximos y vencidos)
- Cual es mi caja prevista a 7/30/60 dias?
- Que ventas no estan facturadas?
- Que margen medio estoy consiguiendo?
- Que operaciones tienen riesgo?

## Riesgos
1. Datos financieros incompletos: muchas ventas no tendran coste real -> mostrar "incompleto"
2. IVA: en V4 se aplica tasa configurable, no se genera SII/AEAT
3. No es contabilidad oficial: es control financiero interno

## Orden de Implementacion
1. Schema + migration
2. CustomerInvoice service + actions + UI
3. Treasury service + auto-generation + UI
4. Profitability calculations + UI
5. Executive Cockpit
6. IA financial context
