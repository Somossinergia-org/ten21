# Navigation Map V7.5

## Current Sidebar (8 groups, ~35 items for JEFE)

| Group | Items | Issues |
|-------|-------|--------|
| (ungrouped) | Dashboard, Cockpit | OK but rename "Cockpit" → "Cockpit ejecutivo" |
| Ventas | Ventas, Clientes, Posventa | OK |
| Compras | Pedidos, Productos, Proveedores | Could be 1 entry "Compras" |
| Almacen | Inventario, Recepcion, Incidencias | OK for ALMACEN role |
| Reparto | Vehiculos, Entregas, Agenda, Movil reparto, Movil almacen | Mobile doesn't belong here |
| Sistema | 14 items! | Way too many. Mix of finance, settings, tools |
| Admin | 7 items | Should not be visible to JEFE |

## Proposed Sidebar (6 groups, 20 items for JEFE)

### Inicio
- Inicio (Dashboard)
- Cockpit ejecutivo

### Operaciones
- Ventas
- Clientes
- Compras (consolidates pedidos + subpages for products/suppliers)
- Almacen (for JEFE links to /reception; ALMACEN sees full submenu)
- Entregas
- Posventa

### Finanzas
- Tesoreria
- Facturas (consolidates client + supplier)
- Rentabilidad

### Automatizacion
- Automatizaciones
- Notificaciones (all roles)
- Inteligencia IA

### Ajustes
- Usuarios
- Mi tienda
- Modulos
- Suscripcion
- Seguridad (all roles)

### Admin (interno)
- Tenants
- Billing
- Lifecycle
- Compliance
- Security
- Salud
- Feature Flags
(Future: gate by SUPERADMIN role or feature flag admin_panel_visible)

## Items Removed from Sidebar
- Movil reparto → accessed via role-specific redirect or /mobile/reparto directly
- Movil almacen → accessed via role-specific redirect
- Productos → submenu of Compras
- Proveedores → submenu of Compras
- Estadisticas → merged into Dashboard/Cockpit
- RGPD → stays in compliance, accessible from /settings/compliance but not sidebar top
- Fact. proveedor → merged under "Facturas"
