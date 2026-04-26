import { z } from "zod";

export const notificationTypeEnum = z.enum([
  "INCIDENT_CREATED",
  "DELIVERY_FAILED",
  "ORDER_PARTIAL",
  "INVOICE_MISMATCH",
  "SYSTEM",
]);

export const notificationSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createNotificationSchema = z.object({
  type: notificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  severity: notificationSeverityEnum.default("MEDIUM"),
  entityType: z.string().max(50).optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
