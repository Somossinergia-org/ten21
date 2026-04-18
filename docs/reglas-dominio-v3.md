# Reglas de Dominio V3 — Ventas, Stock y Posventa

## Estados de SalesOrder

```
DRAFT -> CONFIRMED -> PARTIALLY_RESERVED | RESERVED -> IN_DELIVERY -> DELIVERED
                   \-> CANCELLED (desde DRAFT, CONFIRMED, PARTIALLY_RESERVED, RESERVED)
```

| Transicion | Disparador | Efecto |
|------------|-----------|--------|
| DRAFT -> CONFIRMED | Jefe confirma | Intenta reservar stock |
| CONFIRMED -> RESERVED | Stock suficiente para todo | SALE_RESERVE por linea |
| CONFIRMED -> PARTIALLY_RESERVED | Stock parcial | SALE_RESERVE donde hay |
| RESERVED -> IN_DELIVERY | Se crea Delivery vinculada | - |
| IN_DELIVERY -> DELIVERED | Delivery completada | DELIVERY_OUT por linea |
| * -> CANCELLED | Jefe cancela (antes de DELIVERED) | SALE_RELEASE si habia reserva |

## Reglas de ProductInventory

- **onHand**: stock fisico real en almacen
- **reserved**: comprometido por ventas confirmadas, aun no entregado
- **available**: onHand - reserved (puede ser 0, nunca negativo automatico)
- Se actualiza SOLO via StockMovement en transaccion atomica
- No se recalcula desde movimientos; es un snapshot actualizado por cada operacion

## StockMovement (inmutable)

| Tipo | Origen | onHand | reserved | available |
|------|--------|--------|----------|-----------|
| RECEPTION_IN | Reception completada | +qty | = | +qty |
| SALE_RESERVE | Venta confirmada | = | +qty | -qty |
| SALE_RELEASE | Venta cancelada | = | -qty | +qty |
| DELIVERY_OUT | Entrega completada | -qty | -qty | = |
| MANUAL_ADJUSTMENT | Ajuste JEFE | +/-qty | = | +/-qty |

## Reglas Criticas

1. **No stock negativo automatico**: Si available < quantity al reservar, reservar solo lo disponible y marcar PARTIALLY_RESERVED
2. **No doble salida**: Si una Delivery ya tiene DELIVERY_OUT registrado, no generar otro
3. **Cancelacion segura**: Antes de CANCELLED, liberar toda reserva pendiente
4. **Recepcion solo util**: RECEPTION_IN = quantityReceived - quantityDamaged
5. **Ajuste manual**: Solo JEFE, motivo obligatorio, ActivityLog
6. **Margen estimado**: (unitSalePrice - unitExpectedCost) * quantity por linea

## Permisos V3

### JEFE
- Ventas: CRUD completo, confirmar, cancelar
- Inventario: ver todo, ajuste manual
- Posventa: CRUD completo, asignar, cerrar
- Dashboard: KPIs de ventas, stock, posventa

### ALMACEN
- Inventario: ver stock (lectura)
- Sin acceso a ventas ni posventa

### REPARTO
- Entregas: ver lineas de venta vinculadas (lectura)
- Sin acceso a ventas, inventario ni posventa

## PostSaleTicket

### Estados
```
OPEN -> IN_PROGRESS -> WAITING_SUPPLIER -> RESOLVED -> CLOSED
```
- CLOSED requiere resolution escrita (igual que Incident)
- Solo JEFE puede transicionar estados
- Tickets HIGH/URGENT generan notificacion automatica

### Tipos
DAMAGE, MISSING_ITEM, INSTALLATION, WARRANTY, RETURN, OTHER

### Diferencia con Incident
- Incident: problemas de recepcion (proveedor -> almacen)
- PostSaleTicket: problemas postventa (almacen/entrega -> cliente)
- Son dominios separados, no se mezclan
