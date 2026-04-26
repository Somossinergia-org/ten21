-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "externalId" TEXT,
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenantId_externalId_key" ON "Vehicle"("tenantId", "externalId");
