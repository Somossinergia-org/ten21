import { db } from "@/lib/db";
import type { CreatePostSaleTicketInput } from "@/lib/validations/post-sales";
import type { PostSaleTicketStatus } from "@prisma/client";

async function generateTicketNumber(tenantId: string): Promise<string> {
  const last = await db.postSaleTicket.findFirst({
    where: { tenantId },
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  if (!last) return "SAT-001";
  const num = parseInt(last.ticketNumber.replace("SAT-", ""), 10);
  return `SAT-${(num + 1).toString().padStart(3, "0")}`;
}

const validTransitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "WAITING_SUPPLIER", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["WAITING_SUPPLIER", "RESOLVED", "CLOSED"],
  WAITING_SUPPLIER: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  return (validTransitions[from] || []).includes(to);
}

export async function listTickets(tenantId: string, statusFilter?: string) {
  return db.postSaleTicket.findMany({
    where: {
      tenantId,
      ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter as PostSaleTicketStatus } : {}),
    },
    include: {
      customer: { select: { fullName: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTicket(id: string, tenantId: string) {
  return db.postSaleTicket.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      salesOrder: { select: { id: true, orderNumber: true, status: true } },
      delivery: { select: { id: true, deliveryNumber: true, status: true } },
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });
}

export async function createTicket(
  data: CreatePostSaleTicketInput,
  tenantId: string,
  createdById: string,
) {
  const ticketNumber = await generateTicketNumber(tenantId);
  return db.postSaleTicket.create({
    data: {
      ticketNumber,
      customerId: data.customerId,
      salesOrderId: data.salesOrderId || null,
      deliveryId: data.deliveryId || null,
      type: data.type,
      priority: data.priority,
      description: data.description,
      assignedToId: data.assignedToId || null,
      createdById,
      tenantId,
    },
  });
}

export async function transitionTicket(
  id: string,
  tenantId: string,
  newStatus: PostSaleTicketStatus,
  resolution?: string,
) {
  const ticket = await db.postSaleTicket.findFirst({ where: { id, tenantId } });
  if (!ticket) throw new Error("Ticket no encontrado");

  if (!isValidTransition(ticket.status, newStatus)) {
    throw new Error(`No se puede pasar de ${ticket.status} a ${newStatus}`);
  }

  if (newStatus === "CLOSED" && (!resolution || !resolution.trim())) {
    throw new Error("Se requiere una resolucion para cerrar el ticket");
  }

  const data: Record<string, unknown> = { status: newStatus };
  if (newStatus === "RESOLVED") data.resolvedAt = new Date();
  if (newStatus === "CLOSED") {
    data.closedAt = new Date();
    data.resolution = resolution;
  }

  return db.postSaleTicket.update({ where: { id }, data });
}
