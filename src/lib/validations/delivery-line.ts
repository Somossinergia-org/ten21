import { z } from "zod";

export const deliveryLineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "La descripción es obligatoria").max(500),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  notes: z.string().max(500).optional().default(""),
});

export type DeliveryLineInput = z.infer<typeof deliveryLineSchema>;
