import { z } from "zod";

export const advanceOnboardingSchema = z.object({
  step: z.number().int().min(0).max(6),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type AdvanceOnboardingInput = z.infer<typeof advanceOnboardingSchema>;
