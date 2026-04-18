/**
 * Backfill: crea Customer a partir de deliveries existentes
 * y vincula Delivery.customerId.
 *
 * Estrategia conservadora:
 * - Agrupa deliveries por (tenantId, customerName, customerAddress)
 * - Coincidencia exacta solamente (no deduplica variaciones)
 * - No borra ni modifica datos existentes de Delivery
 *
 * Ejecución: npx ts-node prisma/backfill-customers.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== BACKFILL: Delivery → Customer ===\n");

  const tenants = await prisma.tenant.findMany({ where: { active: true } });

  let totalCreated = 0;
  let totalLinked = 0;
  let totalSkipped = 0;

  for (const tenant of tenants) {
    console.log(`Tenant: ${tenant.name} (${tenant.id})`);

    // Buscar deliveries sin customerId
    const deliveries = await prisma.delivery.findMany({
      where: { tenantId: tenant.id, customerId: null },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
      },
    });

    if (deliveries.length === 0) {
      console.log("  Sin deliveries pendientes de vincular.\n");
      continue;
    }

    // Agrupar por (customerName + customerAddress) — coincidencia exacta
    const groups = new Map<string, typeof deliveries>();
    for (const d of deliveries) {
      const key = `${d.customerName.trim().toLowerCase()}|${d.customerAddress.trim().toLowerCase()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }

    console.log(`  ${deliveries.length} deliveries → ${groups.size} clientes únicos`);

    for (const [, group] of groups) {
      const first = group[0];

      // Comprobar si ya existe un Customer con esos datos exactos
      const existing = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          fullName: first.customerName,
          addressLine1: first.customerAddress,
        },
      });

      let customerId: string;

      if (existing) {
        customerId = existing.id;
        totalSkipped++;
      } else {
        try {
          const customer = await prisma.customer.create({
            data: {
              tenantId: tenant.id,
              fullName: first.customerName,
              phone: first.customerPhone || undefined,
              addressLine1: first.customerAddress,
            },
          });
          customerId = customer.id;
          totalCreated++;
          console.log(`  + Cliente: ${customer.fullName}`);
        } catch (e) {
          console.error(`  ! Error creando cliente "${first.customerName}":`, e);
          continue;
        }
      }

      // Vincular todas las deliveries del grupo
      const ids = group.map((d) => d.id);
      await prisma.delivery.updateMany({
        where: { id: { in: ids } },
        data: { customerId },
      });
      totalLinked += ids.length;
    }

    console.log("");
  }

  console.log("=== RESUMEN ===");
  console.log(`Clientes creados: ${totalCreated}`);
  console.log(`Clientes ya existentes (skip): ${totalSkipped}`);
  console.log(`Deliveries vinculadas: ${totalLinked}`);
}

main()
  .catch((e) => {
    console.error("Error en backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
