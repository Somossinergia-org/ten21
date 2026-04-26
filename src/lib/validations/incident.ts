import { z } from "zod";

export const transitionIncidentSchema = z.object({
  incidentId: z.string().min(1),
  newStatus: z.enum(["NOTIFIED", "REVIEWED", "CLOSED"]),
  resolution: z.string().max(1000).optional(),
});

export type TransitionIncidentInput = z.infer<typeof transitionIncidentSchema>;
