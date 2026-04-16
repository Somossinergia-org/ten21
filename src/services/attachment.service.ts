import { db } from "@/lib/db";
import type { AttachmentEntity } from "@prisma/client";

type CreateInput = {
  tenantId: string;
  entity: AttachmentEntity;
  entityId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  uploadedById: string;
  uploadedByName: string;
  notes?: string;
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function createAttachment(data: CreateInput) {
  if (data.fileSize > MAX_FILE_SIZE) {
    throw new Error("El archivo es demasiado grande (máx 2MB)");
  }

  return db.attachment.create({
    data: {
      tenantId: data.tenantId,
      entity: data.entity,
      entityId: data.entityId,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      dataUrl: data.dataUrl,
      uploadedById: data.uploadedById,
      uploadedByName: data.uploadedByName,
      notes: data.notes || null,
    },
  });
}

export async function listForEntity(
  tenantId: string,
  entity: AttachmentEntity,
  entityId: string,
) {
  return db.attachment.findMany({
    where: { tenantId, entity, entityId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      notes: true,
      uploadedByName: true,
      createdAt: true,
    },
  });
}

export async function getAttachment(id: string, tenantId: string) {
  return db.attachment.findFirst({
    where: { id, tenantId },
  });
}

export async function deleteAttachment(id: string, tenantId: string) {
  return db.attachment.deleteMany({
    where: { id, tenantId },
  });
}
