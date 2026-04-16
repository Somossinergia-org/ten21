import { db } from "@/lib/db";
import type { DataExportType, DataDeletionType, DataDeletionStatus } from "@prisma/client";

export async function createExportRequest(tenantId: string, requestedById: string, type: DataExportType, reason?: string) {
  // One active per tenant
  const existing = await db.dataExportRequest.findFirst({
    where: { tenantId, status: { in: ["REQUESTED", "PROCESSING"] } },
  });
  if (existing) throw new Error("Ya existe una solicitud activa. Espera a que se complete.");

  return db.dataExportRequest.create({
    data: {
      tenantId, requestedById, type,
      reason: reason || null,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
}

export async function listExportRequests(tenantId: string) {
  return db.dataExportRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function processExport(id: string) {
  const req = await db.dataExportRequest.findUnique({ where: { id } });
  if (!req) throw new Error("Solicitud no encontrada");

  await db.dataExportRequest.update({
    where: { id }, data: { status: "PROCESSING" },
  });

  // Gather all tenant data
  const tenantId = req.tenantId;
  const [config, users, customers, products, sales, invoices] = await Promise.all([
    db.tenantConfig.findUnique({ where: { tenantId } }),
    db.user.findMany({ where: { tenantId }, select: { id: true, email: true, name: true, role: true } }),
    db.customer.findMany({ where: { tenantId } }),
    db.product.findMany({ where: { tenantId } }),
    db.salesOrder.findMany({ where: { tenantId }, include: { lines: true } }),
    db.customerInvoice.findMany({ where: { tenantId }, include: { lines: true } }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    type: req.type,
    tenantId,
    data: { config, users, customers, products, sales, invoices },
  };

  // Create FileAsset with JSON export
  const asset = await db.fileAsset.create({
    data: {
      tenantId,
      provider: "local",
      storageKey: `export-${id}-${Date.now()}.json`,
      publicUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(exportData)).toString("base64")}`,
      mimeType: "application/json",
      fileName: `export-${req.type.toLowerCase()}-${Date.now()}.json`,
      fileSize: JSON.stringify(exportData).length,
      uploadedById: req.requestedById,
    },
  });

  return db.dataExportRequest.update({
    where: { id },
    data: {
      status: "READY",
      fileAssetId: asset.id,
      completedAt: new Date(),
    },
  });
}

export async function createDeletionRequest(tenantId: string, requestedById: string, data: {
  type: DataDeletionType; targetEntityType?: string; targetEntityId?: string; reason: string;
}) {
  return db.dataDeletionRequest.create({
    data: {
      tenantId, requestedById,
      type: data.type,
      targetEntityType: data.targetEntityType || null,
      targetEntityId: data.targetEntityId || null,
      reason: data.reason,
    },
  });
}

export async function listDeletionRequests(tenantId?: string) {
  return db.dataDeletionRequest.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function processDeletion(id: string, approvedById: string, approved: boolean) {
  const req = await db.dataDeletionRequest.findUnique({ where: { id } });
  if (!req) throw new Error("Solicitud no encontrada");

  if (!approved) {
    return db.dataDeletionRequest.update({
      where: { id },
      data: { status: "REJECTED", approvedById, completedAt: new Date() },
    });
  }

  await db.dataDeletionRequest.update({
    where: { id },
    data: { status: "PROCESSING", approvedById },
  });

  try {
    if (req.type === "CUSTOMER_DATA" && req.targetEntityId) {
      // Anonymize customer
      await db.customer.update({
        where: { id: req.targetEntityId },
        data: {
          fullName: "[Anonimizado]",
          phone: null, email: null,
          addressLine1: "[Redactado]",
          addressLine2: null, city: null, postalCode: null, province: null,
          notes: null, active: false,
        },
      });
    }

    return db.dataDeletionRequest.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } catch {
    return db.dataDeletionRequest.update({
      where: { id },
      data: { status: "FAILED", completedAt: new Date() },
    });
  }
}

export async function anonymizeStatus(tenantId: string): Promise<DataDeletionStatus | null> {
  const latest = await db.dataDeletionRequest.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  return latest?.status || null;
}
