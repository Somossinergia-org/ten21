"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/tenant";
import * as attachmentService from "@/services/attachment.service";
import type { AttachmentEntity } from "@prisma/client";

type ActionResult = { success: boolean; error?: string };

export async function uploadAttachmentAction(data: {
  entity: AttachmentEntity;
  entityId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  notes?: string;
}): Promise<ActionResult> {
  const session = await requireAuth();
  const user = session.user;

  try {
    await attachmentService.createAttachment({
      tenantId: user.tenantId,
      entity: data.entity,
      entityId: data.entityId,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      dataUrl: data.dataUrl,
      uploadedById: user.id,
      uploadedByName: user.name,
      notes: data.notes,
    });

    // Revalidate the detail page
    const pathMap: Record<AttachmentEntity, string> = {
      PURCHASE_ORDER: `/purchases/${data.entityId}`,
      RECEPTION: `/reception/${data.entityId}`,
      INCIDENT: `/incidents/${data.entityId}`,
      DELIVERY: `/vehicles/deliveries/${data.entityId}`,
    };
    revalidatePath(pathMap[data.entity]);

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al subir" };
  }
}

export async function deleteAttachmentAction(data: {
  id: string;
  entity: AttachmentEntity;
  entityId: string;
}): Promise<ActionResult> {
  const session = await requireAuth();

  try {
    await attachmentService.deleteAttachment(data.id, session.user.tenantId);

    const pathMap: Record<AttachmentEntity, string> = {
      PURCHASE_ORDER: `/purchases/${data.entityId}`,
      RECEPTION: `/reception/${data.entityId}`,
      INCIDENT: `/incidents/${data.entityId}`,
      DELIVERY: `/vehicles/deliveries/${data.entityId}`,
    };
    revalidatePath(pathMap[data.entity]);

    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar" };
  }
}
