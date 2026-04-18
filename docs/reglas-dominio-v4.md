# Reglas de Dominio V4 — Tesoreria, Rentabilidad, Facturacion

## Tesoreria: Esperada vs Confirmada

| Tipo | Origen | Cuando se crea | Cuando se confirma |
|------|--------|---------------|-------------------|
| EXPENSE_EXPECTED | SupplierInvoice validada | Al validar/crear factura proveedor | Al marcar como pagada |
| EXPENSE_CONFIRMED | SupplierInvoice pagada | Al pagar | - |
| INCOME_EXPECTED | CustomerInvoice emitida | Al emitir factura cliente | Al cobrar |
| INCOME_CONFIRMED | CustomerInvoice cobrada | Al cobrar | - |
| MANUAL | Jefe | Creacion manual | Al confirmar |

## Forecast de Tesoreria
- forecast(N dias) = sum(INCOME entries, dueDate <= now+N) - sum(EXPENSE entries, dueDate <= now+N)
- Solo entradas con status PENDING o UPCOMING
- Entradas PAID/CANCELLED no cuentan en forecast

## Margen Estimado vs Real

### Estimado (ya existe en V3)
lineMargin = (unitSalePrice - unitExpectedCost) * quantity
salesOrderMargin = sum(lineMargins)

### Real (V4)
- Se calcula al completar entrega (DELIVERED)
- Toma coste de: PurchaseOrderLine.expectedUnitCost (mejor dato disponible)
- Si SupplierInvoice vinculada tiene totalAmount diferente, marcar varianza
- Si no hay coste fiable, realMargin = null (mostrar "incompleto")
- SalesOrder.realMargin se congela al entregar

## CustomerInvoice

### Estados
```
DRAFT -> ISSUED -> PARTIALLY_PAID -> PAID
                                  -> OVERDUE (automatico si dueDate < hoy)
      -> CANCELLED (solo desde DRAFT o ISSUED)
```

### Reglas
- ISSUED requiere al menos una linea con importe > 0
- CANCELLED requiere motivo y ActivityLog
- Al emitir: crear TreasuryEntry INCOME_EXPECTED
- Al cobrar total: crear TreasuryEntry INCOME_CONFIRMED, actualizar SalesOrder.paymentStatus
- OVERDUE: estado derivado, no se almacena. Se calcula en consulta (dueDate < now AND status != PAID/CANCELLED)

## SupplierInvoice (extension V4)
- paidDate: cuando se pago
- varianceAmount: diferencia vs PurchaseOrder esperado
- Al validar: crear TreasuryEntry EXPENSE_EXPECTED
- Al pagar: crear TreasuryEntry EXPENSE_CONFIRMED

## Permisos V4

### JEFE
- Facturacion cliente: CRUD completo
- Tesoreria: ver todo, entradas manuales, marcar pagado/cobrado
- Rentabilidad: ver todo
- Cockpit ejecutivo: acceso completo

### ALMACEN
- Sin acceso a finanzas, tesoreria ni rentabilidad

### REPARTO
- Sin acceso a finanzas, tesoreria ni rentabilidad

## Reglas Criticas
- No borrar fisicamente entradas financieras. Solo cancelar.
- Todo cambio financiero deja ActivityLog
- Montos en Decimal (Prisma). No usar float.
- IVA: tasa por linea en CustomerInvoiceLine. Por defecto 21%.
- No es contabilidad oficial. No genera SII ni modelo 303.
