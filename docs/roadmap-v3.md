# Roadmap V3 — Deuda Tecnica y Futuro

## Deuda Tecnica

| Item | Severidad | Detalle |
|------|-----------|---------|
| Adjuntos en base64 en BD | Media | Migrar a S3/R2 |
| Sin rate limiting | Media | API endpoints sin proteccion |
| Sin 2FA | Baja | Solo password + JWT |
| Sin retry para Gemini/GPS | Baja | Fallo = error |
| Sin notificaciones externas | Media | Solo internas |
| Password policy basica | Baja | Solo min 6 chars |
| Quick-access demo en produccion | Baja | Eliminar en prod |
| Stock sin multi-sede | Info | Un almacen por tenant |

## Fuera de V3 (Decisiones Abiertas)

1. **Facturacion fiscal a cliente**: No hay factura oficial de venta. Solo hay SalesOrder. Si se necesita facturacion con IVA/IRPF, es un modulo aparte.
2. **Pipeline comercial / Leads**: No existe ni se planea. El sistema es operativo, no CRM de captacion.
3. **Stock multi-sede**: ProductInventory es global por tenant. No hay division por almacen/tienda.
4. **PWA para repartidores**: Web responsive actual. Decidir si PWA mejora la experiencia de REPARTO.
5. **Presupuestos formales**: SalesOrder actua como compromiso de venta. No hay presupuesto previo con validez.
6. **Devolucion con impacto en stock**: PostSaleTicket tipo RETURN no revierte stock automaticamente. Es manual.
7. **Alertas de stock bajo configurables**: Hoy solo se muestra available <= 0. No hay umbral configurable por producto.

## Prioridad V4

### Alta
- Alertas de stock bajo configurables (umbral por producto)
- Notificaciones por email (al menos incidencias criticas y posventa urgente)
- Exportar ventas a Excel
- Vista resumen de margen real vs estimado

### Media
- Presupuestos simples (antes de SalesOrder)
- Devolucion con impacto automatico en stock
- Metricas por repartidor
- PWA para REPARTO

### Baja
- Facturacion fiscal a cliente
- Pipeline comercial
- 2FA
- Stock multi-sede
- App nativa
