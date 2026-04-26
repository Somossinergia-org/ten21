# Roadmap V4 — Deuda Tecnica y Futuro

## Fuera de V4

| Item | Motivo |
|------|--------|
| Contabilidad oficial / SII / AEAT | V4 es control financiero interno, no contabilidad fiscal |
| Pasarelas bancarias | Sin integracion bancaria automatica |
| Conciliacion bancaria real | Solo conciliacion manual vs pedidos/facturas |
| WhatsApp/email externos | Solo notificaciones internas |
| Multi-sede financiera | Tesoreria es por tenant, no por sede |
| Modelo 303 / IVA oficial | Solo tracking interno de IVA por factura |
| Presupuestos formales pre-venta | SalesOrder es el compromiso, no hay presupuesto previo |

## Deuda Tecnica Acumulada

| Item | Severidad |
|------|-----------|
| Adjuntos base64 en BD | Media |
| Sin rate limiting | Media |
| Sin 2FA | Baja |
| Sin retry Gemini/GPS | Baja |
| Password policy basica | Baja |
| Quick-access demo | Baja |

## Prioridad V5

### Alta
- Alertas de stock bajo configurables (umbral por producto)
- Notificaciones por email para cobros/pagos vencidos
- Exportar facturas cliente a PDF
- Conciliacion automatica factura proveedor vs pedido mejorada

### Media
- Presupuestos simples pre-SalesOrder
- Devolucion posventa con impacto automatico en stock
- Metricas por repartidor
- Informe mensual de P&L automatico

### Baja
- 2FA
- Pasarela bancaria
- Stock multi-sede
- App nativa movil
