# Permission Matrix V7.5

## Role: JEFE

| Module | Access | Notes |
|--------|--------|-------|
| Dashboard | Full read | KPIs, alerts, sparklines |
| Cockpit ejecutivo | Full read | Cash forecast, margins, alerts |
| Ventas | Full CRUD | Create, confirm, cancel |
| Clientes | Full CRUD | Create, edit, deactivate, 360 view |
| Compras | Full CRUD | PO, products, suppliers |
| Almacen | Full | Inventory, reception, incidents management |
| Reparto | Full | Vehicles, deliveries, calendar |
| Posventa | Full CRUD | Tickets, state transitions |
| Tesoreria | Full | View, manual entries, mark paid |
| Facturas cliente | Full CRUD | Create, issue, record payment |
| Facturas proveedor | Full | View, reconcile, IVA summary |
| Rentabilidad | Read | Margin analysis |
| Automatizaciones | Full CRUD | Rules, templates, queue |
| Notificaciones | Read + mark read | Own + global |
| IA | Full | Chat, briefing, extraction, reports |
| Usuarios | Full CRUD | Create, password, deactivate |
| Mi tienda | Full | TenantConfig |
| Modulos | Full | Toggle modules |
| Suscripcion | Read + change plan | Billing settings |
| Seguridad | Full personal | MFA on/off |
| RGPD | Full | Export, deletion requests |

## Role: ALMACEN

| Module | Access | Notes |
|--------|--------|-------|
| Inventario | Read only | Stock levels |
| Recepcion | Create | Create receptions with auto-incidents |
| Incidencias | Read only | Cannot change status |
| Notificaciones | Read + mark read | Own + global |
| Seguridad | MFA personal | Own MFA only |

## Role: REPARTO

| Module | Access | Notes |
|--------|--------|-------|
| Vehiculos | Read | List only |
| Entregas | Own only | Create, start, complete OWN deliveries |
| Agenda | Own only | Own calendar entries |
| Notificaciones | Read + mark read | Own + global |
| Seguridad | MFA personal | Own MFA only |

## Special States

### Restricted Mode (PAST_DUE / EXPIRED)
- Login: Yes
- Billing settings: Yes
- Compliance export: Yes
- Read dashboards: Yes
- Create sales/orders: No
- Confirm sales: No
- Create automations: No
- New users: No

### Module Disabled
- Sidebar entry hidden
- Page returns redirect or 403 (not yet enforced server-side — visual only)

### Admin (interno — no separate SUPERADMIN role yet)
- Currently accessible by JEFE
- Should be gated by feature flag or role in V8
- Contains: tenants, billing global, lifecycle, compliance, security, health, flags
