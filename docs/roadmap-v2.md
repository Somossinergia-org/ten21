# Roadmap V2 — TodoMueble

## Deuda Tecnica

| Item | Severidad | Detalle |
|------|-----------|---------|
| Adjuntos en base64 en BD | Media | Escala mal con volumen. Migrar a storage externo (S3, Cloudflare R2) |
| Sin rate limiting | Media | API endpoints expuestos sin proteccion contra abuso |
| Sin 2FA | Baja | Solo password + JWT. No hay segundo factor |
| Sin retry/circuit breaker para Gemini | Baja | Si Gemini falla, la operacion falla. No hay reintentos |
| Sin notificaciones externas | Media | Solo notificaciones internas. No hay email/push/WhatsApp |
| Password policy basica | Baja | Solo minimo 6 caracteres. Sin complejidad, sin expiracion |
| Sin logs de login | Baja | No se registran intentos de login fallidos |
| Quick-access con password en cliente | Baja | Solo para demo. Eliminar en produccion |
| Setup secret como fallback hardcodeado | Baja | Se lee de env var pero tiene fallback. Eliminar fallback en produccion |

## Decisiones Abiertas

1. **Entidad Cliente completa vs ligera**: Hoy Customer tiene datos basicos. Se necesita decidir si agregar: CIF/NIF, tipo (particular/empresa), segmento, limite de credito.
2. **Stock/Inventario**: No existe. Se necesita decidir si Product debe tener cantidades en stock, o si se infiere de recepciones - entregas.
3. **Ventas/Presupuestos**: El flujo de salida hoy es Delivery sin concepto de "venta". Se necesita decidir si agregar: Presupuesto → Venta → Factura a cliente.
4. **Multi-sede**: El sistema es multi-tenant (multi-tienda) pero no multi-sede dentro de un tenant. Decidir si es necesario.
5. **App movil para REPARTO**: Actualmente web responsive. Decidir si PWA o app nativa para repartidores.

## Alcance Recomendado V3

### Prioridad Alta
- Inventario basico (stock por producto, movimientos automaticos)
- Vinculacion DeliveryLine a productos reales en UI de creacion
- Notificaciones por email (al menos para incidencias criticas)
- Exportar mas entidades a Excel (clientes, entregas)

### Prioridad Media
- Dashboard mejorado con graficos historicos (mes a mes)
- Metricas por repartidor (entregas completadas, fallidas, km)
- Presupuestos simples (antes de la entrega)
- PWA para REPARTO

### Prioridad Baja
- Multi-sede dentro de tenant
- 2FA
- Storage externo para adjuntos
- App nativa movil
- Integracion WhatsApp Business
