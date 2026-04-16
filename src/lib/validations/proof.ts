import { z } from "zod";

export const createProofSchema = z.object({
  deliveryId: z.string().min(1),
  type: z.enum(["PHOTO", "SIGNATURE", "GPS_SNAPSHOT", "NOTE"]),
  note: z.string().max(1000).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  fileDataUrl: z.string().optional(),
  fileName: z.string().max(200).optional(),
  requestId: z.string().optional(),
});

export type CreateProofInput = z.infer<typeof createProofSchema>;
