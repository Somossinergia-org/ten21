import { z } from "zod";

export const createAutomationRuleSchema = z.object({
  code: z.string().min(1).max(50),
  eventType: z.enum([
    "DELIVERY_ASSIGNED", "DELIVERY_IN_TRANSIT", "DELIVERY_FAILED",
    "DELIVERY_DELIVERED", "POST_SALE_URGENT", "INVOICE_OVERDUE",
  ]),
  channel: z.enum(["INTERNAL", "PUSH", "EMAIL", "WHATSAPP"]),
  target: z.enum(["USER", "CUSTOMER", "ROLE"]),
  templateId: z.string().optional(),
  conditionsJson: z.any().optional(),
});

export const createTemplateSchema = z.object({
  code: z.string().min(1).max(50),
  channel: z.enum(["INTERNAL", "PUSH", "EMAIL", "WHATSAPP"]),
  eventType: z.string().min(1),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(2000),
});

export type CreateAutomationRuleInput = z.infer<typeof createAutomationRuleSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
