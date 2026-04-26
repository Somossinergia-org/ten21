# Roadmap V5 — Deuda Tecnica y Futuro

## Fuera de V5

| Item | Motivo |
|------|--------|
| Routing inteligente multi-parada | Requiere motor de optimizacion de rutas |
| Mapa avanzado con tracking en vivo | Requiere WebSocket/SSE e integracion maps |
| SMS como canal | Sin proveedor SMS integrado |
| Chatbot para clientes | Fuera del alcance operativo |
| Migracion completa de adjuntos legacy | Requiere batch job y downtime controlado |
| Service Worker con cache offline completo | PWA basica con manifest, cache avanzado en V6 |

## Deuda Tecnica Acumulada

| Item | Severidad |
|------|-----------|
| Adjuntos legacy base64 sin migrar | Media |
| Sin rate limiting | Media |
| Sin 2FA | Baja |
| Worker de cola es pull-based (manual) | Media — idealmente cron o webhook trigger |
| Sin retry exponencial real | Baja — backoff lineal actual |
| Password policy basica | Baja |
| Service worker no implementado (solo manifest) | Media — PWA instala pero no cachea offline |

## Prioridad V6

### Alta
- Service worker con cache offline real para reparto
- Worker automatico para cola (cron endpoint o webhook)
- Alertas de stock bajo configurables
- Exportar facturas cliente a PDF
- Rate limiting en API

### Media
- Mapa de entregas del dia
- Plantillas WhatsApp con variables
- Historial de envios por cliente
- Push notifications reales (web-push library)

### Baja
- SMS provider
- Chatbot cliente
- 2FA
- Migracion batch de adjuntos legacy
