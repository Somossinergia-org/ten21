# TodoMueble — Plataforma de Gestion Operativa

Sistema SaaS de control operativo para tiendas de muebles y electrodomesticos. Conecta la operativa completa del negocio: pedidos a proveedor, recepcion de mercancia, deteccion automatica de incidencias, entregas a cliente con control de flota, e inteligencia artificial para el jefe.

## Que NO es este sistema

No es un CRM comercial clasico. No tiene leads, pipeline de ventas ni oportunidades. Es una **plataforma de gestion operativa** que automatiza los flujos internos de una tienda fisica de muebles y electrodomesticos.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Auth | NextAuth v4 (JWT, 8h) |
| UI | Tailwind CSS + Recharts + FullCalendar |
| IA | Google Gemini 2.5 Flash |
| Deploy | Vercel + Neon PostgreSQL |

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable | Descripcion | Obligatoria |
|----------|-------------|-------------|
| DATABASE_URL | PostgreSQL connection string | Si |
| NEXTAUTH_SECRET | Random secret para JWT | Si |
| NEXTAUTH_URL | URL base de la app | Si |
| GEMINI_API_KEY | API key de Google Gemini | Si |
| GPS_API_BASE_URL | Endpoint de ControlGPS | No |
| GPS_API_KEY | API key de ControlGPS | No |
| SETUP_SECRET | Secret para endpoint /api/setup | No |

## Instalacion local

```bash
# Instalar dependencias
npm install

# Arrancar PostgreSQL
sudo service postgresql start

# Crear base de datos (primera vez)
createdb ten21

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos demo
npx prisma db seed

# Arrancar desarrollo
npm run dev
```

## Comandos

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Servidor de produccion |
| `npm run test` | Ejecutar tests (Vitest) |
| `npm run lint` | Linter |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:seed` | Seed de datos |
| `npm run db:reset` | Reset completo con seed |

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| **JEFE** | Todo: dashboard, compras, productos, proveedores, clientes, recepcion, incidencias, vehiculos, entregas, finanzas, IA, usuarios, estadisticas |
| **ALMACEN** | Recepcion (crear), incidencias (lectura), notificaciones |
| **REPARTO** | Vehiculos (ver), entregas (propias), calendario (propio), notificaciones |

## Credenciales demo

| Rol | Email | Password |
|-----|-------|----------|
| Jefe | jefe@todomueble.com | password123 |
| Almacen | almacen@todomueble.com | password123 |
| Reparto | reparto@todomueble.com | password123 |

## Dominios funcionales

### Flujo de entrada (proveedor a almacen)
```
PurchaseOrder (DRAFT->SENT) -> Reception -> Comparacion automatica -> Incident
```
- Deteccion automatica de discrepancias de cantidad y mercancia danada
- Actualizacion automatica del estado del pedido (PARTIAL/RECEIVED)
- Trazabilidad completa de incidencias (REGISTERED->NOTIFIED->REVIEWED->CLOSED)

### Flujo de salida (almacen a cliente)
```
Delivery (ASSIGNED->IN_TRANSIT->DELIVERED/FAILED) + Vehicle (AVAILABLE<->IN_USE)
```
- Asignacion de vehiculo y repartidor
- Control de kilometraje (startKm, endKm)
- Calendario de entregas con FullCalendar

### Clientes
- Entidad centralizada con historial de entregas
- Vista 360: datos, direccion, entregas pasadas

### Notificaciones
- Alertas internas para: incidencias, entregas fallidas, pedidos parciales, facturas discrepantes
- Campana en header con contador de no leidas

### Inteligencia Artificial
- Chat contextual (Agente TodoMueble)
- Briefing matutino con voz
- Deteccion de anomalias
- Extraccion OCR de facturas/documentos
- Informe diario

### Finanzas
- Facturas de proveedor con estados (PENDING->VALIDATED/MISMATCH->PAID)
- Resumen IVA trimestral
- Conciliacion factura-pedido
- Alertas de vencimiento

## Estructura de carpetas

```
src/
  app/
    (app)/              # App protegida (dashboard, customers, purchases...)
    (auth)/login/       # Login
    api/                # API routes (agent, export, finance, search, setup)
    pitch/              # Presentacion comercial
  actions/              # Server Actions por dominio
  services/             # Logica de negocio pura
  components/           # UI (layout, agent, attachments, timeline, dashboard)
  lib/                  # Auth, DB, tenant helpers, validaciones Zod
prisma/
  schema.prisma         # 18 modelos, 11 enums
  seed.ts               # Datos demo TodoMueble Guardamar
  backfill-customers.ts # Migracion Delivery->Customer
  migrations/
tests/
  unit/                 # 68 tests (validaciones, estado, tipos)
docs/
  plan_arquitectura.md
  reglas-dominio.md
  roadmap-v2.md
```

## Limitaciones actuales

- Adjuntos almacenados en base64 en BD (max 2MB)
- Sin notificaciones externas (email/push)
- Sin inventario/stock
- Sin ventas/presupuestos/facturacion a cliente
- Sin 2FA ni rate limiting
- Sin retry para llamadas a Gemini
