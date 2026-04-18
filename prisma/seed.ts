import { PrismaClient, Role, PurchaseOrderType, VehicleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hash(pw, 10);

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // TENANT: TodoMueble Guardamar
  // ============================================================
  const tenant = await prisma.tenant.create({
    data: { name: "TodoMueble Guardamar", slug: "todomueble" },
  });
  const t = tenant.id;

  // --- USERS ---
  const jefe = await prisma.user.create({
    data: { email: "jefe@todomueble.com", name: "Carlos Gutierrez", password: await hash("password123"), role: Role.JEFE, tenantId: t },
  });
  const almacen = await prisma.user.create({
    data: { email: "almacen@todomueble.com", name: "Raquel Martinez", password: await hash("password123"), role: Role.ALMACEN, tenantId: t },
  });
  const reparto1 = await prisma.user.create({
    data: { email: "reparto@todomueble.com", name: "Demetrio Lopez", password: await hash("password123"), role: Role.REPARTO, tenantId: t },
  });
  const reparto2 = await prisma.user.create({
    data: { email: "reparto2@todomueble.com", name: "Miguel Torres", password: await hash("password123"), role: Role.REPARTO, tenantId: t },
  });

  // --- SUPPLIERS (proveedores reales del sector) ---
  const provColchones = await prisma.supplier.create({
    data: { name: "Sistemas del Descanso S.L.", code: "PROV-001", phone: "961 862 504", email: "pedidos@descanso.es", tenantId: t },
  });
  const provMuebles = await prisma.supplier.create({
    data: { name: "Muebles del Sur S.L.", code: "PROV-002", phone: "950 445 678", email: "ventas@mueblessur.es", tenantId: t },
  });
  const provElectro = await prisma.supplier.create({
    data: { name: "Tien21 Distribucion", code: "PROV-003", phone: "902 100 200", email: "pedidos@tien21dist.es", tenantId: t },
  });

  // --- PRODUCTS (muebles + electrodomesticos) ---
  const topperVisco = await prisma.product.create({ data: { ref: "COL-001", name: "Topper Visco 6cm 150x190", description: "Sobrecolchon viscoelastico 6cm", tenantId: t } });
  const colchonVisco = await prisma.product.create({ data: { ref: "COL-002", name: "Colchon Visco Premium 150x190", description: "Colchon viscoelastico firmeza media-alta", tenantId: t } });
  const sillonOficina = await prisma.product.create({ data: { ref: "SIL-001", name: "Sillon de Oficina Ergonomico", description: "Sillon giratorio con reposabrazos", tenantId: t } });
  const sofaTres = await prisma.product.create({ data: { ref: "SOF-001", name: "Sofa 3 plazas Modelo Confort", description: "Sofa 3 plazas tapizado gris", tenantId: t } });
  const mesaComedor = await prisma.product.create({ data: { ref: "MES-001", name: "Mesa Comedor Extensible Roble", description: "Mesa extensible 140-200cm roble natural", tenantId: t } });
  const sillasPack = await prisma.product.create({ data: { ref: "SIL-002", name: "Pack 4 Sillas Comedor", description: "Pack 4 sillas tapizadas beige", tenantId: t } });
  const lavadora = await prisma.product.create({ data: { ref: "LAV-001", name: "Lavadora Samsung 8kg 1400rpm", description: "Lavadora carga frontal EcoBubble", tenantId: t } });
  const frigorifico = await prisma.product.create({ data: { ref: "FRI-001", name: "Frigorifico Bosch NoFrost 186cm", description: "Frigorifico combi NoFrost clase A", tenantId: t } });
  const lavavajillas = await prisma.product.create({ data: { ref: "LVV-001", name: "Lavavajillas Siemens 60cm", description: "Lavavajillas integrable 14 servicios", tenantId: t } });
  const jardinera = await prisma.product.create({ data: { ref: "JAR-001", name: "Jardinera Mimbre Exterior", description: "Jardinera de mimbre para terraza", tenantId: t } });

  // --- VEHICLES ---
  const furg1 = await prisma.vehicle.create({ data: { plate: "4521-KLM", name: "Furgoneta MAN grande", status: VehicleStatus.IN_USE, tenantId: t } });
  const furg2 = await prisma.vehicle.create({ data: { plate: "7834-NPQ", name: "Furgoneta Iveco", status: VehicleStatus.AVAILABLE, tenantId: t } });
  await prisma.vehicle.create({ data: { plate: "1122-RST", name: "Furgoneta Mercedes Sprinter", status: VehicleStatus.AVAILABLE, tenantId: t } });

  const now = new Date();

  // ============================================================
  // PEDIDOS
  // ============================================================

  // PED-001: Colchones — RECEIVED
  const ped1 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-001", type: PurchaseOrderType.SALE, supplierId: provColchones.id,
      status: "RECEIVED", notes: "Pedido colchones para cliente", tenantId: t, createdById: jefe.id,
      lines: { create: [
        { productId: topperVisco.id, quantityOrdered: 2, quantityReceived: 2, expectedUnitCost: 85.00 },
        { productId: colchonVisco.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 320.00 },
      ] },
    },
  });
  await prisma.reception.create({
    data: {
      receptionNumber: "REC-001", purchaseOrderId: ped1.id, deliveryNoteRef: "ALB-4883",
      status: "COMPLETED", receivedById: almacen.id, receivedAt: new Date(now.getTime() - 3 * 86400000), tenantId: t,
      lines: { create: [
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped1.id, productId: topperVisco.id } }))!.id, quantityExpected: 2, quantityReceived: 2, quantityDamaged: 0 },
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped1.id, productId: colchonVisco.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 0 },
      ] },
    },
  });

  // PED-002: Muebles — PARTIAL (con incidencias)
  const ped2 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-002", type: PurchaseOrderType.SALE, supplierId: provMuebles.id,
      status: "PARTIAL", notes: "Pedido salon completo", tenantId: t, createdById: jefe.id,
      lines: { create: [
        { productId: sofaTres.id, quantityOrdered: 2, quantityReceived: 1, expectedUnitCost: 450.00 },
        { productId: mesaComedor.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 380.00 },
        { productId: sillasPack.id, quantityOrdered: 2, quantityReceived: 0, expectedUnitCost: 220.00 },
        { productId: jardinera.id, quantityOrdered: 3, quantityReceived: 0, expectedUnitCost: 45.00 },
      ] },
    },
  });
  const rec2 = await prisma.reception.create({
    data: {
      receptionNumber: "REC-002", purchaseOrderId: ped2.id, deliveryNoteRef: "ALB-21685",
      status: "WITH_INCIDENTS", receivedById: almacen.id, receivedAt: new Date(now.getTime() - 86400000), tenantId: t,
      lines: { create: [
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: sofaTres.id } }))!.id, quantityExpected: 2, quantityReceived: 1, quantityDamaged: 0 },
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: mesaComedor.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 0 },
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: sillasPack.id } }))!.id, quantityExpected: 2, quantityReceived: 0, quantityDamaged: 0 },
        { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: jardinera.id } }))!.id, quantityExpected: 3, quantityReceived: 0, quantityDamaged: 0, notes: "Falta servir jardinera — anotado a mano" },
      ] },
    },
  });
  await prisma.incident.create({ data: { receptionId: rec2.id, type: "QUANTITY_MISMATCH", status: "REGISTERED", description: "SOF-001 (Sofa 3 plazas): se esperaban 2, se recibio 1 (falta 1)", reportedById: almacen.id, tenantId: t } });
  await prisma.incident.create({ data: { receptionId: rec2.id, type: "QUANTITY_MISMATCH", status: "NOTIFIED", description: "SIL-002 (Pack 4 Sillas): se esperaban 2, se recibieron 0 (faltan 2 packs)", reportedById: almacen.id, tenantId: t } });
  await prisma.incident.create({ data: { receptionId: rec2.id, type: "QUANTITY_MISMATCH", status: "REGISTERED", description: "JAR-001 (Jardinera Mimbre): se esperaban 3, se recibieron 0 (faltan 3)", reportedById: almacen.id, tenantId: t } });

  // PED-003: Tien21 electrodomesticos — SENT
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-003", type: PurchaseOrderType.SALE, supplierId: provElectro.id,
      status: "SENT", notes: "Pedido electrodomesticos semana", tenantId: t, createdById: jefe.id,
      lines: { create: [
        { productId: lavadora.id, quantityOrdered: 3, expectedUnitCost: 320.00 },
        { productId: frigorifico.id, quantityOrdered: 2, expectedUnitCost: 580.00 },
        { productId: lavavajillas.id, quantityOrdered: 1, expectedUnitCost: 420.00 },
      ] },
    },
  });

  // PED-004: Exposicion — SENT
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-004", type: PurchaseOrderType.EXHIBITION, supplierId: provMuebles.id,
      status: "SENT", notes: "Exposicion nueva temporada verano", tenantId: t, createdById: jefe.id,
      lines: { create: [
        { productId: sofaTres.id, quantityOrdered: 1, expectedUnitCost: 450.00 },
        { productId: jardinera.id, quantityOrdered: 4, expectedUnitCost: 45.00 },
      ] },
    },
  });

  // PED-005: DRAFT
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-005", type: PurchaseOrderType.SALE, supplierId: provColchones.id,
      status: "DRAFT", notes: "Preparar para la proxima semana", tenantId: t, createdById: jefe.id,
      lines: { create: [
        { productId: colchonVisco.id, quantityOrdered: 3, expectedUnitCost: 320.00 },
        { productId: topperVisco.id, quantityOrdered: 2, expectedUnitCost: 85.00 },
      ] },
    },
  });

  // PED-006: Rapido — RECEIVED hoy
  const ped6 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-006", type: PurchaseOrderType.SALE, supplierId: provColchones.id,
      status: "RECEIVED", notes: "Urgente cliente espera", tenantId: t, createdById: jefe.id,
      lines: { create: [{ productId: sillonOficina.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 215.00 }] },
    },
  });
  await prisma.reception.create({
    data: {
      receptionNumber: "REC-003", purchaseOrderId: ped6.id, deliveryNoteRef: "ALB-EXP-412",
      status: "COMPLETED", receivedById: almacen.id, receivedAt: now, tenantId: t,
      lines: { create: [{ purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped6.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 0 }] },
    },
  });

  // Incidencia cerrada historica
  const ped7 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PED-007", type: PurchaseOrderType.SALE, supplierId: provElectro.id,
      status: "RECEIVED", tenantId: t, createdById: jefe.id,
      lines: { create: [{ productId: lavadora.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 320.00 }] },
    },
  });
  const rec4 = await prisma.reception.create({
    data: {
      receptionNumber: "REC-004", purchaseOrderId: ped7.id,
      status: "WITH_INCIDENTS", receivedById: almacen.id,
      receivedAt: new Date(now.getTime() - 7 * 86400000), tenantId: t,
      lines: { create: [{ purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped7.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 1 }] },
    },
  });
  await prisma.incident.create({
    data: {
      receptionId: rec4.id, type: "DAMAGED", status: "CLOSED",
      description: "LAV-001 (Lavadora Samsung 8kg): puerta con arañazo visible",
      resolution: "Proveedor envio unidad de reposicion",
      reviewedAt: new Date(now.getTime() - 5 * 86400000),
      closedAt: new Date(now.getTime() - 4 * 86400000),
      closedById: jefe.id,
      reportedById: almacen.id, tenantId: t,
    },
  });

  // ============================================================
  // ENTREGAS
  // ============================================================
  await prisma.delivery.create({ data: { deliveryNumber: "ENT-001", vehicleId: furg1.id, assignedToId: reparto1.id, customerName: "Carmen Rodriguez", customerPhone: "658 112 233", customerAddress: "C/ Mayor 15, 2ºB, Guardamar del Segura", description: "Sofa 3 plazas + Mesa comedor extensible", status: "IN_TRANSIT", scheduledDate: now, startKm: 45230, tenantId: t } });
  await prisma.delivery.create({ data: { deliveryNumber: "ENT-002", vehicleId: furg2.id, assignedToId: reparto2.id, customerName: "Antonio Perez", customerPhone: "677 445 566", customerAddress: "Avda. de la Libertad 22, Rojales", description: "Sillon de Oficina Ergonomico", status: "ASSIGNED", scheduledDate: now, tenantId: t } });
  await prisma.delivery.create({ data: { deliveryNumber: "ENT-003", vehicleId: furg1.id, assignedToId: reparto1.id, customerName: "Maria Garcia", customerPhone: "612 998 877", customerAddress: "C/ San Pedro 8, 1ºA, Torrevieja", description: "Colchon Visco Premium 150x190 + Topper", status: "DELIVERED", scheduledDate: new Date(now.getTime() - 86400000), deliveredAt: new Date(now.getTime() - 86400000), startKm: 44980, endKm: 45120, tenantId: t } });
  await prisma.delivery.create({ data: { deliveryNumber: "ENT-004", vehicleId: furg2.id, assignedToId: reparto2.id, customerName: "Isabel Navarro", customerAddress: "C/ Olivos 22, Benijofar", description: "Lavadora Samsung 8kg", status: "FAILED", scheduledDate: new Date(now.getTime() - 2 * 86400000), deliveredAt: new Date(now.getTime() - 2 * 86400000), startKm: 44800, endKm: 44850, notes: "Cliente no estaba en domicilio", tenantId: t } });
  await prisma.delivery.create({ data: { deliveryNumber: "ENT-005", customerName: "Pedro Martinez", customerPhone: "644 223 344", customerAddress: "Urb. Marina, Guardamar del Segura", description: "Pack 4 Sillas Comedor + Jardineras mimbre", status: "PENDING", scheduledDate: new Date(now.getTime() + 2 * 86400000), tenantId: t } });

  console.log("");
  console.log("=== SEED COMPLETADO ===");
  console.log("");
  console.log("Tenant: TodoMueble Guardamar (todomueble)");
  console.log("");
  console.log("Credenciales:");
  console.log("  Jefe:      jefe@todomueble.com / password123");
  console.log("  Almacen:   almacen@todomueble.com / password123");
  console.log("  Reparto 1: reparto@todomueble.com / password123");
  console.log("  Reparto 2: reparto2@todomueble.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
