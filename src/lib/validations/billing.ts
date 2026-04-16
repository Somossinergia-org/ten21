import { z } from "zod";

export const changePlanSchema = z.object({
  planCode: z.string().min(1),
});

export const pauseSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const createPlanSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  priceCents: z.number().int().min(0),
  currency: z.string().default("EUR"),
  featuresJson: z.record(z.string(), z.unknown()).optional(),
  limitsJson: z.record(z.string(), z.number()).optional(),
});
