import { db } from "@/lib/db";
import type { CreateProofInput } from "@/lib/validations/proof";
import type { DeliveryProofType } from "@prisma/client";

export async function createProof(data: CreateProofInput, tenantId: string, capturedById: string) {
  // Idempotency check
  if (data.requestId) {
    const existing = await db.deliveryProof.findFirst({
      where: { tenantId, requestId: data.requestId },
    });
    if (existing) return existing;
  }

  let fileAssetId: string | null = null;

  // Store file if provided
  if (data.fileDataUrl && data.fileName) {
    const asset = await db.fileAsset.create({
      data: {
        tenantId,
        provider: "local",
        storageKey: `proof-${Date.now()}-${data.fileName}`,
        publicUrl: data.fileDataUrl,
        mimeType: data.fileDataUrl.startsWith("data:image") ? "image/jpeg" : "application/octet-stream",
        fileName: data.fileName,
        fileSize: data.fileDataUrl.length,
        uploadedById: capturedById,
      },
    });
    fileAssetId = asset.id;
  }

  return db.deliveryProof.create({
    data: {
      tenantId,
      deliveryId: data.deliveryId,
      type: data.type as DeliveryProofType,
      fileAssetId,
      note: data.note || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      capturedById,
      requestId: data.requestId || null,
    },
  });
}

export async function listProofs(deliveryId: string, tenantId: string) {
  return db.deliveryProof.findMany({
    where: { deliveryId, tenantId },
    include: { fileAsset: { select: { publicUrl: true, fileName: true, mimeType: true } } },
    orderBy: { capturedAt: "desc" },
  });
}
