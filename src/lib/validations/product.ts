import { z } from "zod";

export const createProductSchema = z.object({
  ref: z.string().min(1, "La referencia es obligatoria").max(50),
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(500).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
