import { z } from "zod";

export const postSaleTicketTypeEnum = z.enum([
  "DAMAGE", "MISSING_ITEM", "INSTALLATION", "WARRANTY", "RETURN", "OTHER",
]);

export const postSaleTicketPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const postSaleTicketStatusEnum = z.enum([
  "OPEN", "IN_PROGRESS", "WAITING_SUPPLIER", "RESOLVED", "CLOSED",
]);

export const createPostSaleTicketSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente"),
  salesOrderId: z.string().optional(),
  deliveryId: z.string().optional(),
  type: postSaleTicketTypeEnum,
  priority: postSaleTicketPriorityEnum.default("NORMAL"),
  description: z.string().min(1, "La descripcion es obligatoria").max(2000),
  assignedToId: z.string().optional(),
});

export const transitionPostSaleTicketSchema = z.object({
  ticketId: z.string().min(1),
  newStatus: postSaleTicketStatusEnum,
  resolution: z.string().max(2000).optional(),
});

export type CreatePostSaleTicketInput = z.infer<typeof createPostSaleTicketSchema>;
