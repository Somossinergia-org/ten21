"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createPostSaleTicketSchema, transitionPostSaleTicketSchema } from "@/lib/validations/post-sales";
import * as postsaleService from "@/services/postsale.service";
import * as activity from "@/services/activity.service";
import * as notifService from "@/services/notification.service";

type ActionResult = { success: boolean; error?: string };

export async function createPostSaleTicketAction(data: {
  customerId: string;
  salesOrderId?: string;
  deliveryId?: string;
  type: string;
  priority?: string;
  description: string;
  assignedToId?: string;
}): Promise<ActionResult & { ticketId?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createPostSaleTicketSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const ticket = await postsaleService.createTicket(parsed.data, tenantId, me.id);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "postsale.created", entity: "PostSaleTicket",
      entityId: ticket.id, entityRef: ticket.ticketNumber,
      details: { type: ticket.type, priority: ticket.priority },
    });

    // Notify if HIGH or URGENT
    if (ticket.priority === "HIGH" || ticket.priority === "URGENT") {
      await notifService.createNotification({
        tenantId,
        type: "SYSTEM",
        title: `Ticket posventa ${ticket.priority}`,
        message: `${ticket.ticketNumber}: ${ticket.description.substring(0, 100)}`,
        severity: ticket.priority === "URGENT" ? "HIGH" : "MEDIUM",
        entityType: "PostSaleTicket",
        entityId: ticket.id,
      });
    }

    revalidatePath("/post-sales");
    revalidatePath("/notifications");
    return { success: true, ticketId: ticket.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear ticket" };
  }
}

export async function transitionPostSaleTicketAction(data: {
  ticketId: string;
  newStatus: string;
  resolution?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = transitionPostSaleTicketSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const ticket = await postsaleService.transitionTicket(
      parsed.data.ticketId, tenantId,
      parsed.data.newStatus as "OPEN" | "IN_PROGRESS" | "WAITING_SUPPLIER" | "RESOLVED" | "CLOSED",
      parsed.data.resolution,
    );
    const actionName = parsed.data.newStatus === "CLOSED" ? "postsale.closed" : "postsale.updated";
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: actionName, entity: "PostSaleTicket",
      entityId: ticket.id, entityRef: ticket.ticketNumber,
      details: { newStatus: parsed.data.newStatus, resolution: parsed.data.resolution },
    });
    revalidatePath("/post-sales");
    revalidatePath(`/post-sales/${parsed.data.ticketId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
