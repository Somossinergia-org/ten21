# Plan de Arquitectura V6 — Productizacion SaaS

## Estado V5 Actual
33 modelos, 30+ enums, 125 tests, 10 migraciones, 15 test files.
Flujos cerrados: compras, recepcion, stock, ventas, entregas, posventa,
facturacion, tesoreria, rentabilidad, cockpit, PWA, automatizaciones omnicanal.

## Problema: Acoplamiento a TodoMueble
Puntos hardcodeados en el sistema actual:
- Sidebar: "TM" logo, "TodoMueble" text
- Login: "TodoMueble" title, "Guardamar" subtitle
- Quick-access: nombres especificos de usuarios demo
- Gemini prompt: "Agente TodoMueble Guardamar"
- Setup/seed: productos, proveedores, clientes de un tenant especifico
- Layout metadata: "TodoMueble - Control de Tienda"

## Solucion V6: Separar Nucleo de Configuracion

### TenantConfig
Cada tenant tiene su propia configuracion de negocio:
- Razon social, NIF, contacto, direccion
- Zona horaria, moneda, idioma
- settingsJson para extensiones futuras

### TenantBranding
Cada tenant puede personalizar la UI:
- Logo (via FileAsset)
- Colores primario/secundario/acento
- Nombre de app visible
- Texto hero de login

### TenantModule
Cada tenant activa/desactiva modulos:
- Codigos: purchases, reception, incidents, sales, inventory, deliveries,
  post_sales, finance, treasury, profitability, ai, automations
- La UI y el backend respetan enabled=true/false

### Resolucion de Config
1. Buscar TenantConfig del usuario logueado
2. Si existe campo, usar ese
3. Si no, usar default del sistema
4. Para branding: TenantBranding ?? defaults cyan/dark

## Importaciones Seguras
1. Subir CSV/XLSX -> crear FileAsset
2. Validar estructura y datos -> ImportJob status VALIDATING
3. Preview con errores -> status READY
4. Confirmar -> status IMPORTING -> crear registros en transaccion
5. Resultado -> COMPLETED / PARTIAL / FAILED con errorReportJson
6. Todo dentro de transaccion: si falla, no corrompe datos previos

## Panel Admin Interno
- Separado del panel del JEFE de tienda
- Accesible solo via rol SUPERADMIN o flag especifica
- Gestiona: tenants, feature flags, soporte, salud

## Feature Flags
- Scope GLOBAL: aplica a todos los tenants
- Scope TENANT: override por tenant especifico
- Resolucion: tenant override > global flag > disabled

## Observabilidad
SystemHealthEvent se genera automaticamente en:
- Importaciones fallidas
- Automatizaciones bloqueadas
- Errores de integracion (GPS, Gemini, Email, WhatsApp)
- Errores de storage

## Orden de Implementacion
1. Schema + migration
2. Zod + placeholders + bootstrap script
3. TenantConfig + Branding + Modules UI
4. Onboarding wizard
5. ImportJob flow
6. Admin panel (tenants, flags, support, health)
7. Decouple TodoMueble hardcodes
8. Tests + docs + deploy
