import { NextResponse } from "next/server";
import { PrismaClient, Role, PurchaseOrderType, VehicleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const SETUP_SECRET = "ten21-setup-2026";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  try {
    // Check if already seeded
    const existing = await prisma.tenant.findFirst();
    if (existing) {
      await prisma.$disconnect();
      return NextResponse.json({ status: "already_seeded", tenant: existing.name });
    }

    // === TENANT ===
    const tenant = await prisma.tenant.create({
      data: { name: "Electrodomesticos Lopez", slug: "electro-lopez" },
    });
    const t = tenant.id;

    // === USERS ===
    const jefe = await prisma.user.create({
      data: { email: "jefe@electro-lopez.com", name: "Maria Lopez", password: await hash("password123"), role: Role.JEFE, tenantId: t },
    });
    const almacen = await prisma.user.create({
      data: { email: "almacen@electro-lopez.com", name: "Juan Fernandez", password: await hash("password123"), role: Role.ALMACEN, tenantId: t },
    });
    const reparto1 = await prisma.user.create({
      data: { email: "reparto@electro-lopez.com", name: "Luis Sanchez", password: await hash("password123"), role: Role.REPARTO, tenantId: t },
    });
    const reparto2 = await prisma.user.create({
      data: { email: "reparto2@electro-lopez.com", name: "Miguel Torres", password: await hash("password123"), role: Role.REPARTO, tenantId: t },
    });

    // === SUPPLIERS ===
    const provDistri = await prisma.supplier.create({ data: { name: "Distribuciones Electrohogar S.L.", code: "PROV-001", phone: "968 112 233", email: "pedidos@electrohogar.es", tenantId: t } });
    const provSamsung = await prisma.supplier.create({ data: { name: "Samsung Logistica España", code: "PROV-002", phone: "900 100 120", email: "logistica@samsung.es", tenantId: t } });
    const provBosch = await prisma.supplier.create({ data: { name: "Grupo Bosch Electrodomesticos", code: "PROV-003", phone: "900 200 201", email: "pedidos@bsh-group.es", tenantId: t } });

    // === PRODUCTS ===
    const lavSamsung8 = await prisma.product.create({ data: { ref: "LAV-001", name: "Lavadora Samsung 8kg 1400rpm", tenantId: t } });
    const lavSamsung10 = await prisma.product.create({ data: { ref: "LAV-002", name: "Lavadora Samsung 10kg AddWash", tenantId: t } });
    const friBosch = await prisma.product.create({ data: { ref: "FRI-001", name: "Frigorifico Bosch NoFrost 186cm", tenantId: t } });
    const friSamsung = await prisma.product.create({ data: { ref: "FRI-002", name: "Frigorifico Samsung Twin Cooling", tenantId: t } });
    const lavvSiemens = await prisma.product.create({ data: { ref: "LVV-001", name: "Lavavajillas Siemens 60cm", tenantId: t } });
    const lavvBosch = await prisma.product.create({ data: { ref: "LVV-002", name: "Lavavajillas Bosch 60cm", tenantId: t } });
    const hornoBosch = await prisma.product.create({ data: { ref: "HOR-001", name: "Horno Bosch pirolitico 60cm", tenantId: t } });
    const placaBosch = await prisma.product.create({ data: { ref: "PLA-001", name: "Placa induccion Bosch 3 zonas", tenantId: t } });
    const secSamsung = await prisma.product.create({ data: { ref: "SEC-001", name: "Secadora Samsung 9kg bomba calor", tenantId: t } });
    const microBosch = await prisma.product.create({ data: { ref: "MIC-001", name: "Microondas Bosch 25L", tenantId: t } });

    // === VEHICLES ===
    const furgGrande = await prisma.vehicle.create({ data: { plate: "4521-KLM", name: "Furgoneta MAN grande", status: VehicleStatus.IN_USE, tenantId: t } });
    const furgPeq = await prisma.vehicle.create({ data: { plate: "7834-NPQ", name: "Furgoneta Iveco", status: VehicleStatus.AVAILABLE, tenantId: t } });
    await prisma.vehicle.create({ data: { plate: "1122-RST", name: "Furgoneta Mercedes", status: VehicleStatus.AVAILABLE, tenantId: t } });

    const now = new Date();

    // === PED-001: Samsung RECEIVED ===
    const ped1 = await prisma.purchaseOrder.create({
      data: {
        orderNumber: "PED-001", type: PurchaseOrderType.SALE, supplierId: provSamsung.id,
        status: "RECEIVED", notes: "Pedido cliente Martinez", tenantId: t, createdById: jefe.id,
        lines: { create: [
          { productId: lavSamsung8.id, quantityOrdered: 2, quantityReceived: 2, expectedUnitCost: 320 },
          { productId: friSamsung.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 540 },
        ] },
      },
    });
    await prisma.reception.create({
      data: {
        receptionNumber: "REC-001", purchaseOrderId: ped1.id, deliveryNoteRef: "ALB-SAM-40221",
        status: "COMPLETED", receivedById: almacen.id, receivedAt: new Date(now.getTime() - 3 * 86400000), tenantId: t,
        lines: { create: [
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped1.id, productId: lavSamsung8.id } }))!.id, quantityExpected: 2, quantityReceived: 2, quantityDamaged: 0 },
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped1.id, productId: friSamsung.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 0 },
        ] },
      },
    });

    // === PED-002: Bosch PARTIAL with incidents ===
    const ped2 = await prisma.purchaseOrder.create({
      data: {
        orderNumber: "PED-002", type: PurchaseOrderType.SALE, supplierId: provBosch.id,
        status: "PARTIAL", notes: "Pedido semanal Bosch", tenantId: t, createdById: jefe.id,
        lines: { create: [
          { productId: friBosch.id, quantityOrdered: 3, quantityReceived: 2, expectedUnitCost: 580 },
          { productId: hornoBosch.id, quantityOrdered: 2, quantityReceived: 2, expectedUnitCost: 395 },
          { productId: lavvBosch.id, quantityOrdered: 2, quantityReceived: 0, expectedUnitCost: 420 },
          { productId: placaBosch.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 310 },
        ] },
      },
    });
    const rec2 = await prisma.reception.create({
      data: {
        receptionNumber: "REC-002", purchaseOrderId: ped2.id, deliveryNoteRef: "ALB-BSH-88102",
        status: "WITH_INCIDENTS", receivedById: almacen.id, receivedAt: new Date(now.getTime() - 86400000), tenantId: t,
        lines: { create: [
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: friBosch.id } }))!.id, quantityExpected: 3, quantityReceived: 2, quantityDamaged: 1 },
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: hornoBosch.id } }))!.id, quantityExpected: 2, quantityReceived: 2, quantityDamaged: 0 },
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: lavvBosch.id } }))!.id, quantityExpected: 2, quantityReceived: 0, quantityDamaged: 0 },
          { purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped2.id, productId: placaBosch.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 0 },
        ] },
      },
    });
    await prisma.incident.create({ data: { receptionId: rec2.id, type: "QUANTITY_MISMATCH", status: "REGISTERED", description: "FRI-001 (Frigorifico Bosch NoFrost 186cm): se esperaban 3, se recibieron 2 (falta 1)", reportedById: almacen.id, tenantId: t } });
    await prisma.incident.create({ data: { receptionId: rec2.id, type: "DAMAGED", status: "NOTIFIED", description: "FRI-001 (Frigorifico Bosch NoFrost 186cm): 1 unidad con golpe en lateral derecho", reportedById: almacen.id, tenantId: t } });
    await prisma.incident.create({ data: { receptionId: rec2.id, type: "QUANTITY_MISMATCH", status: "REGISTERED", description: "LVV-002 (Lavavajillas Bosch 60cm): se esperaban 2, se recibieron 0 (faltan 2)", reportedById: almacen.id, tenantId: t } });

    // === PED-003 & PED-004: SENT ===
    await prisma.purchaseOrder.create({ data: { orderNumber: "PED-003", type: PurchaseOrderType.SALE, supplierId: provDistri.id, status: "SENT", notes: "Reposicion electrodomesticos pequeños", tenantId: t, createdById: jefe.id, lines: { create: [{ productId: microBosch.id, quantityOrdered: 4, expectedUnitCost: 89 }, { productId: secSamsung.id, quantityOrdered: 2, expectedUnitCost: 485 }] } } });
    await prisma.purchaseOrder.create({ data: { orderNumber: "PED-004", type: PurchaseOrderType.EXHIBITION, supplierId: provSamsung.id, status: "SENT", notes: "Exposicion nueva gama Samsung", tenantId: t, createdById: jefe.id, lines: { create: [{ productId: lavSamsung10.id, quantityOrdered: 1, expectedUnitCost: 420 }, { productId: friSamsung.id, quantityOrdered: 1, expectedUnitCost: 540 }, { productId: secSamsung.id, quantityOrdered: 1, expectedUnitCost: 485 }] } } });

    // === PED-005: DRAFT ===
    await prisma.purchaseOrder.create({ data: { orderNumber: "PED-005", type: PurchaseOrderType.SALE, supplierId: provBosch.id, status: "DRAFT", notes: "Preparar semana que viene", tenantId: t, createdById: jefe.id, lines: { create: [{ productId: lavvSiemens.id, quantityOrdered: 3, expectedUnitCost: 445 }, { productId: hornoBosch.id, quantityOrdered: 1, expectedUnitCost: 395 }] } } });

    // === PED-006: RECEIVED today ===
    const ped6 = await prisma.purchaseOrder.create({ data: { orderNumber: "PED-006", type: PurchaseOrderType.SALE, supplierId: provDistri.id, status: "RECEIVED", notes: "Pedido rapido microondas", tenantId: t, createdById: jefe.id, lines: { create: [{ productId: microBosch.id, quantityOrdered: 2, quantityReceived: 2, expectedUnitCost: 89 }] } } });
    await prisma.reception.create({ data: { receptionNumber: "REC-003", purchaseOrderId: ped6.id, deliveryNoteRef: "ALB-EH-9930", status: "COMPLETED", receivedById: almacen.id, receivedAt: now, tenantId: t, lines: { create: [{ purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped6.id, productId: microBosch.id } }))!.id, quantityExpected: 2, quantityReceived: 2, quantityDamaged: 0 }] } } });

    // === PED-007: historical with closed incident ===
    const ped7 = await prisma.purchaseOrder.create({ data: { orderNumber: "PED-007", type: PurchaseOrderType.SALE, supplierId: provSamsung.id, status: "RECEIVED", tenantId: t, createdById: jefe.id, lines: { create: [{ productId: lavSamsung8.id, quantityOrdered: 1, quantityReceived: 1, expectedUnitCost: 320 }] } } });
    const rec4 = await prisma.reception.create({ data: { receptionNumber: "REC-004", purchaseOrderId: ped7.id, status: "WITH_INCIDENTS", receivedById: almacen.id, receivedAt: new Date(now.getTime() - 7 * 86400000), tenantId: t, lines: { create: [{ purchaseOrderLineId: (await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: ped7.id } }))!.id, quantityExpected: 1, quantityReceived: 1, quantityDamaged: 1 }] } } });
    await prisma.incident.create({ data: { receptionId: rec4.id, type: "DAMAGED", status: "CLOSED", description: "LAV-001 (Lavadora Samsung 8kg): puerta con arañazo visible", resolution: "Proveedor envio unidad de reposicion el 03/04", reviewedAt: new Date(now.getTime() - 5 * 86400000), closedAt: new Date(now.getTime() - 4 * 86400000), closedById: jefe.id, reportedById: almacen.id, tenantId: t } });

    // === DELIVERIES ===
    await prisma.delivery.create({ data: { deliveryNumber: "ENT-001", vehicleId: furgGrande.id, assignedToId: reparto1.id, customerName: "Antonio Martinez", customerPhone: "658 112 233", customerAddress: "C/ Gran Via 45, 2ºB, Murcia", description: "Lavadora Samsung 8kg + Frigorifico Samsung Twin Cooling", status: "IN_TRANSIT", scheduledDate: now, startKm: 45230, tenantId: t } });
    await prisma.delivery.create({ data: { deliveryNumber: "ENT-002", vehicleId: furgPeq.id, assignedToId: reparto2.id, customerName: "Carmen Ruiz", customerPhone: "677 445 566", customerAddress: "Avda. Libertad 12, bajo, Cartagena", description: "Horno Bosch pirolitico + Placa induccion Bosch", status: "ASSIGNED", scheduledDate: now, tenantId: t } });
    await prisma.delivery.create({ data: { deliveryNumber: "ENT-003", vehicleId: furgGrande.id, assignedToId: reparto1.id, customerName: "Francisco Gomez", customerPhone: "612 998 877", customerAddress: "C/ Almirante 8, 1ºA, Lorca", description: "Frigorifico Bosch NoFrost 186cm", status: "DELIVERED", scheduledDate: new Date(now.getTime() - 86400000), deliveredAt: new Date(now.getTime() - 86400000), startKm: 44980, endKm: 45120, tenantId: t } });
    await prisma.delivery.create({ data: { deliveryNumber: "ENT-004", vehicleId: furgPeq.id, assignedToId: reparto2.id, customerName: "Isabel Navarro", customerAddress: "C/ Olivos 22, Molina de Segura", description: "Lavavajillas Siemens 60cm", status: "FAILED", scheduledDate: new Date(now.getTime() - 2 * 86400000), deliveredAt: new Date(now.getTime() - 2 * 86400000), startKm: 44800, endKm: 44850, notes: "Cliente no estaba en domicilio", tenantId: t } });
    await prisma.delivery.create({ data: { deliveryNumber: "ENT-005", customerName: "Pedro Sanchez", customerPhone: "644 223 344", customerAddress: "Avda. Juan Carlos I, 15, Murcia", description: "Secadora Samsung 9kg bomba calor", status: "PENDING", scheduledDate: new Date(now.getTime() + 2 * 86400000), tenantId: t } });

    await prisma.$disconnect();
    return NextResponse.json({ status: "seeded", tenant: tenant.name });
  } catch (e: unknown) {
    await prisma.$disconnect();
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
