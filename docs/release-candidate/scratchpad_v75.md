# V7.5 Scratchpad — Reasoning

## Current Sidebar Issues
1. **Too many items**: ~35 nav items in 8 groups. JEFE sees ALL of them.
2. **Mixed concerns**: "Sistema" mixes finance, IA, users, branding, billing, security, RGPD = 14 items
3. **Admin visible to JEFE**: /admin/* should be SUPERADMIN only. Currently JEFE sees 7 admin items.
4. **Mobile in wrong place**: "Movil reparto" and "Movil almacen" in "Reparto" group makes no sense
5. **Duplicated wallet icon**: Tesoreria and Fact. proveedor both use Wallet
6. **Dashboard vs Cockpit**: unclear distinction for users
7. **Facturas split**: "Facturas cliente" in Sistema, "Fact. proveedor" also in Sistema

## New Navigation Design

### For JEFE (6 groups, ~20 items max)
1. **Inicio** (2): Dashboard, Cockpit ejecutivo
2. **Operaciones** (6): Ventas, Clientes, Compras, Almacen, Reparto, Posventa
3. **Finanzas** (3): Tesoreria, Facturas, Rentabilidad
4. **Automatizacion** (3): Automatizaciones, Notificaciones, IA
5. **Configuracion** (6): Catalogo, Usuarios, Mi tienda, Modulos, Suscripcion, Seguridad
6. **Admin** (hidden from JEFE, only future SUPERADMIN): 7 items

### For ALMACEN (2 groups, ~5 items)
1. **Almacen**: Inventario, Recepcion, Incidencias
2. **Sistema**: Notificaciones, Seguridad

### For REPARTO (2 groups, ~5 items)
1. **Reparto**: Vehiculos, Entregas, Agenda
2. **Sistema**: Notificaciones, Seguridad

### Key Decisions
- **Compras** subsection: Pedidos + Productos + Proveedores collapsed under one "Compras" link that goes to /purchases
- **Almacen** subsection: Recepcion + Incidencias + Inventario collapsed under "Almacen"
- **Reparto** subsection: Vehiculos + Entregas + Agenda collapsed under "Reparto"
- **Mobile**: removed from sidebar entirely. REPARTO and ALMACEN access their mobile views directly via their role routes.
- **Admin**: Hidden from JEFE. In V7.5, keep it visible (since we don't have SUPERADMIN yet) but mark it as "(Interno)" to signal it's not for client use.
- **Facturas**: merge client + supplier under one "/finance/invoices" entry; add sub-nav inside page if needed

## Permission Issues to Fix
1. Admin panel accessible by JEFE — should be admin-only (but no SUPERADMIN role yet)
2. REPARTO delivery detail access check was added in V2 but need to verify still works after all refactors
3. TenantModule not actually checked in page loads — just navigation hiding (visual only)

## Data Integrity Checks Needed
1. Do all customers have tenantId? (backfill V2 should have covered this)
2. Are there orphan DeliveryLines without deliveryId?
3. Are there StockMovements without matching ProductInventory?
4. TenantSubscription for demo tenant — was bootstrapped via /api/bootstrap-v7
5. Seeds still coupled to TodoMueble but that's expected for demo
