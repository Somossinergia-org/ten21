import { PrismaClient, Role, PurchaseOrderType, VehicleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // TENANT 1: Muebles Garcia
  // ============================================================
  const tenant1 = await prisma.tenant.create({
    data: {
      name: "Muebles Garcia",
      slug: "muebles-garcia",
    },
  });

  // Usuarios tenant 1
  const jefe1 = await prisma.user.create({
    data: {
      email: "jefe@muebles-garcia.com",
      name: "Carlos Garcia",
      password: await hashPassword("password123"),
      role: Role.JEFE,
      tenantId: tenant1.id,
    },
  });

  const almacen1 = await prisma.user.create({
    data: {
      email: "almacen@muebles-garcia.com",
      name: "Ana Martinez",
      password: await hashPassword("password123"),
      role: Role.ALMACEN,
      tenantId: tenant1.id,
    },
  });

  const reparto1 = await prisma.user.create({
    data: {
      email: "reparto@muebles-garcia.com",
      name: "Pedro Lopez",
      password: await hashPassword("password123"),
      role: Role.REPARTO,
      tenantId: tenant1.id,
    },
  });

  // Proveedores tenant 1
  const supplier1a = await prisma.supplier.create({
    data: {
      name: "Muebles del Norte S.L.",
      code: "PROV-001",
      phone: "945 123 456",
      email: "pedidos@mueblesdelNorte.es",
      tenantId: tenant1.id,
    },
  });

  const supplier1b = await prisma.supplier.create({
    data: {
      name: "Distribuciones Hogar",
      code: "PROV-002",
      phone: "916 789 012",
      email: "ventas@disthogar.es",
      tenantId: tenant1.id,
    },
  });

  // Productos tenant 1
  const product1a = await prisma.product.create({
    data: {
      ref: "SOF-001",
      name: "Sofa 3 plazas Modelo Confort",
      description: "Sofa de 3 plazas tapizado en tela gris",
      tenantId: tenant1.id,
    },
  });

  const product1b = await prisma.product.create({
    data: {
      ref: "MES-001",
      name: "Mesa comedor extensible Roble",
      description: "Mesa de comedor extensible de 140 a 200 cm en roble natural",
      tenantId: tenant1.id,
    },
  });

  const product1c = await prisma.product.create({
    data: {
      ref: "SIL-001",
      name: "Silla comedor Pack 4 uds",
      description: "Pack de 4 sillas de comedor tapizadas en beige",
      tenantId: tenant1.id,
    },
  });

  const product1d = await prisma.product.create({
    data: {
      ref: "ARM-001",
      name: "Armario 3 puertas Blanco",
      description: "Armario de 3 puertas correderas en blanco mate",
      tenantId: tenant1.id,
    },
  });

  const product1e = await prisma.product.create({
    data: {
      ref: "COL-001",
      name: "Colchon viscoelastico 150x190",
      description: "Colchon viscoelastico firmeza media",
      tenantId: tenant1.id,
    },
  });

  // Vehiculos tenant 1
  await prisma.vehicle.create({
    data: {
      plate: "1234-ABC",
      name: "Furgoneta grande",
      status: VehicleStatus.AVAILABLE,
      tenantId: tenant1.id,
    },
  });

  await prisma.vehicle.create({
    data: {
      plate: "5678-DEF",
      name: "Furgoneta pequena",
      status: VehicleStatus.AVAILABLE,
      tenantId: tenant1.id,
    },
  });

  // Pedido de ejemplo tenant 1 (en estado SENT)
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-001",
      type: PurchaseOrderType.SALE,
      supplierId: supplier1a.id,
      status: "SENT",
      notes: "Pedido urgente para cliente Perez",
      tenantId: tenant1.id,
      createdById: jefe1.id,
      lines: {
        create: [
          {
            productId: product1a.id,
            quantityOrdered: 2,
            expectedUnitCost: 450.0,
          },
          {
            productId: product1b.id,
            quantityOrdered: 1,
            expectedUnitCost: 380.0,
          },
          {
            productId: product1c.id,
            quantityOrdered: 2,
            expectedUnitCost: 220.0,
          },
        ],
      },
    },
  });

  // Pedido en borrador tenant 1
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-002",
      type: PurchaseOrderType.EXHIBITION,
      supplierId: supplier1b.id,
      status: "DRAFT",
      notes: "Muestrario nueva temporada",
      tenantId: tenant1.id,
      createdById: jefe1.id,
      lines: {
        create: [
          {
            productId: product1d.id,
            quantityOrdered: 1,
            expectedUnitCost: 520.0,
          },
          {
            productId: product1e.id,
            quantityOrdered: 2,
            expectedUnitCost: 180.0,
          },
        ],
      },
    },
  });

  // ============================================================
  // TENANT 2: Electrodomesticos Lopez
  // ============================================================
  const tenant2 = await prisma.tenant.create({
    data: {
      name: "Electrodomesticos Lopez",
      slug: "electro-lopez",
    },
  });

  // Usuarios tenant 2
  const jefe2 = await prisma.user.create({
    data: {
      email: "jefe@electro-lopez.com",
      name: "Maria Lopez",
      password: await hashPassword("password123"),
      role: Role.JEFE,
      tenantId: tenant2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "almacen@electro-lopez.com",
      name: "Juan Fernandez",
      password: await hashPassword("password123"),
      role: Role.ALMACEN,
      tenantId: tenant2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "reparto@electro-lopez.com",
      name: "Luis Sanchez",
      password: await hashPassword("password123"),
      role: Role.REPARTO,
      tenantId: tenant2.id,
    },
  });

  // Proveedores tenant 2
  const supplier2a = await prisma.supplier.create({
    data: {
      name: "Tien21 Distribucion",
      code: "PROV-001",
      phone: "902 100 200",
      email: "pedidos@tien21dist.es",
      tenantId: tenant2.id,
    },
  });

  // Productos tenant 2
  const product2a = await prisma.product.create({
    data: {
      ref: "LAV-001",
      name: "Lavadora Samsung 8kg",
      description: "Lavadora carga frontal 8kg 1400rpm",
      tenantId: tenant2.id,
    },
  });

  const product2b = await prisma.product.create({
    data: {
      ref: "FRI-001",
      name: "Frigorifico Bosch NoFrost",
      description: "Frigorifico combi NoFrost 186cm",
      tenantId: tenant2.id,
    },
  });

  const product2c = await prisma.product.create({
    data: {
      ref: "LAV-002",
      name: "Lavavajillas Siemens 60cm",
      description: "Lavavajillas integrable 60cm 14 servicios",
      tenantId: tenant2.id,
    },
  });

  // Vehiculos tenant 2
  await prisma.vehicle.create({
    data: {
      plate: "9012-GHI",
      name: "Camion reparto",
      status: VehicleStatus.AVAILABLE,
      tenantId: tenant2.id,
    },
  });

  // Pedido de ejemplo tenant 2
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-001",
      type: PurchaseOrderType.SALE,
      supplierId: supplier2a.id,
      status: "SENT",
      notes: "Pedido semanal electrodomesticos",
      tenantId: tenant2.id,
      createdById: jefe2.id,
      lines: {
        create: [
          {
            productId: product2a.id,
            quantityOrdered: 3,
            expectedUnitCost: 320.0,
          },
          {
            productId: product2b.id,
            quantityOrdered: 2,
            expectedUnitCost: 580.0,
          },
          {
            productId: product2c.id,
            quantityOrdered: 1,
            expectedUnitCost: 420.0,
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log("");
  console.log("=== TENANT 1: Muebles Garcia ===");
  console.log("  Jefe:    jefe@muebles-garcia.com / password123");
  console.log("  Almacen: almacen@muebles-garcia.com / password123");
  console.log("  Reparto: reparto@muebles-garcia.com / password123");
  console.log("");
  console.log("=== TENANT 2: Electrodomesticos Lopez ===");
  console.log("  Jefe:    jefe@electro-lopez.com / password123");
  console.log("  Almacen: almacen@electro-lopez.com / password123");
  console.log("  Reparto: reparto@electro-lopez.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
