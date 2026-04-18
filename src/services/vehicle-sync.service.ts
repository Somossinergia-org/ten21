import { db } from "@/lib/db";
import { fetchGpsVehicles } from "@/lib/external/gps-api";
import type { VehicleStatus } from "@prisma/client";

/**
 * Map GPS engine status to our VehicleStatus.
 *  engine "1" (motor on) → IN_USE
 *  engine "0" (motor off) → AVAILABLE
 */
function mapEngineToStatus(engine: string): VehicleStatus {
  return engine === "1" ? "IN_USE" : "AVAILABLE";
}

/**
 * Check if a vehicle has any delivery currently IN_TRANSIT.
 * If so, the internal system owns the status — GPS should not overwrite it.
 */
async function hasActiveDelivery(vehicleId: string): Promise<boolean> {
  const count = await db.delivery.count({
    where: { vehicleId, status: "IN_TRANSIT" },
  });
  return count > 0;
}

type SyncResult = {
  total: number;
  created: number;
  updated: number;
  skippedStatus: number;
  errors: string[];
};

/**
 * Sync vehicles from GPS API into the database for a given tenant.
 *
 * - Calls the GPS API (wsAcc=vl)
 * - For each vehicle, upserts by (tenantId, externalId)
 * - Maps: id → externalId, name → name + plate, engine → status
 * - Does NOT overwrite status if the vehicle has an active delivery (IN_TRANSIT)
 */
export async function syncVehicles(tenantId: string): Promise<SyncResult> {
  const gpsVehicles = await fetchGpsVehicles();

  const result: SyncResult = {
    total: gpsVehicles.length,
    created: 0,
    updated: 0,
    skippedStatus: 0,
    errors: [],
  };

  for (const gv of gpsVehicles) {
    try {
      const existing = await db.vehicle.findUnique({
        where: {
          tenantId_externalId: {
            tenantId,
            externalId: gv.id,
          },
        },
      });

      if (existing) {
        const busy = await hasActiveDelivery(existing.id);

        await db.vehicle.update({
          where: { id: existing.id },
          data: {
            name: gv.name,
            lastSyncedAt: new Date(),
            // Only update status if no active delivery
            ...(!busy ? { status: mapEngineToStatus(gv.engine) } : {}),
          },
        });

        if (busy) result.skippedStatus++;
        result.updated++;
      } else {
        // Check if plate already exists (avoid unique conflict)
        const existingByPlate = await db.vehicle.findUnique({
          where: {
            tenantId_plate: {
              tenantId,
              plate: gv.name,
            },
          },
        });

        if (existingByPlate) {
          const busy = await hasActiveDelivery(existingByPlate.id);

          await db.vehicle.update({
            where: { id: existingByPlate.id },
            data: {
              externalId: gv.id,
              lastSyncedAt: new Date(),
              ...(!busy ? { status: mapEngineToStatus(gv.engine) } : {}),
            },
          });

          if (busy) result.skippedStatus++;
          result.updated++;
        } else {
          await db.vehicle.create({
            data: {
              plate: gv.name,
              name: gv.name,
              externalId: gv.id,
              status: mapEngineToStatus(gv.engine),
              lastSyncedAt: new Date(),
              tenantId,
            },
          });
          result.created++;
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      result.errors.push(`Vehicle ${gv.id} (${gv.name}): ${msg}`);
    }
  }

  return result;
}
