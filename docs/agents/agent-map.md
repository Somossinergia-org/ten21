# Agent Map V7.7

## Agent Registry

| # | Code | Name | Domain | Roles | Visibility |
|---|------|------|--------|-------|-----------|
| 1 | orchestrator | Orquestador | Global | JEFE | TENANT |
| 2 | executive | Asistente Ejecutivo | Global | JEFE | TENANT |
| 3 | sales | Agente de Ventas | Ventas | JEFE | TENANT |
| 4 | customers | Agente de Clientes | Clientes | JEFE | TENANT |
| 5 | purchases | Agente de Compras | Compras | JEFE | TENANT |
| 6 | warehouse | Agente de Almacen | Recepcion | JEFE, ALMACEN | TENANT |
| 7 | inventory | Agente de Inventario | Stock | JEFE, ALMACEN | TENANT |
| 8 | deliveries | Agente de Entregas | Reparto | JEFE, REPARTO | TENANT |
| 9 | finance | Agente Financiero | Finanzas | JEFE | TENANT |
| 10 | treasury | Agente de Tesoreria | Caja | JEFE | TENANT |
| 11 | invoices | Agente de Facturacion | Facturas | JEFE | TENANT |
| 12 | profitability | Agente de Rentabilidad | Margenes | JEFE | TENANT |
| 13 | postsales | Agente de Posventa | Tickets | JEFE | TENANT |
| 14 | automations | Agente de Automatizaciones | Cola/Reglas | JEFE | TENANT |
| 15 | billing | Agente SaaS | Billing | JEFE | INTERNAL |
| 16 | compliance | Agente RGPD | Compliance | JEFE | INTERNAL |
| 17 | security | Agente de Seguridad | Security | JEFE | INTERNAL |
| 18 | support | Agente de Soporte | Ops | JEFE | INTERNAL |

## Handoff Rules
- Orchestrator can route to ANY agent
- Executive can request from ANY agent
- Sales <-> Customers (bidirectional)
- Purchases <-> Warehouse <-> Inventory (chain)
- Deliveries <-> PostSales (bidirectional)
- Finance <-> Treasury/Invoices/Profitability (hub)
- Billing <-> Support <-> Compliance (admin chain)
- Security <-> Support (bidirectional)
- Direct cross-domain (e.g. Sales->Security) MUST go through Orchestrator
