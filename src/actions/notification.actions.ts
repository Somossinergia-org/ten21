"use server";

import { requireAuth, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as notifService from "@/services/notification.service";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(id: string) {
  await requireAuth();
  const tenantId = await getTenantId();
  await notifService.markAsRead(id, tenantId);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();
  await notifService.markAllAsRead(tenantId, me.id);
  revalidatePath("/notifications");
}
