import { db } from "@/lib/db";
import { fetchGpsVehicles, type GpsVehicle } from "@/lib/external/gps-api";
import type { VehicleStatus } from "@prisma/client";

/**
 * Map GPS engine status to our VehicleStatus.
 *  engine "1" (motor on) → IN_USE
 *  engine "0" (motor off) → AVAILABLE
 */
function mapEngineToStatus(engine: string): VehicleStatus {
  return engine === "1" ? "IN_USE" : "AVAILABLE";
}

type SyncResult = {
  total: number;
  created: number;
  updated: number;
  errors: string[];
};

/**
 * Sync vehicles from GPS API into the database for a given tenant.
 *
 * - Calls the GPS API (wsAcc=vl)
 * - For each vehicle, upserts by (tenantId, externalId)
 * - Maps: id → externalId, name → name + plate, engine → status
 */
export async function syncVehicles(tenantId: string): Promise<SyncResult> {
  const gpsVehicles = await fetchGpsVehicles();

  const result: SyncResult = {
    total: gpsVehicles.length,
    created: 0,
    updated: 0,
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
        // Update existing vehicle
        await db.vehicle.update({
          where: { id: existing.id },
          data: {
            name: gv.name,
            status: mapEngineToStatus(gv.engine),
            lastSyncedAt: new Date(),
          },
        });
        result.updated++;
      } else {
        // Check if plate already exists (avoid unique conflict)
        const plateValue = gv.name;
        const existingByPlate = await db.vehicle.findUnique({
          where: {
            tenantId_plate: {
              tenantId,
              plate: plateValue,
            },
          },
        });

        if (existingByPlate) {
          // Link existing manual vehicle to external ID
          await db.vehicle.update({
            where: { id: existingByPlate.id },
            data: {
              externalId: gv.id,
              status: mapEngineToStatus(gv.engine),
              lastSyncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          // Create new vehicle
          await db.vehicle.create({
            data: {
              plate: plateValue,
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
