import { z } from "zod";

export const manualAdjustmentSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  quantity: z.number().int().refine((v) => v !== 0, "La cantidad no puede ser 0"),
  notes: z.string().min(1, "El motivo es obligatorio").max(500),
});

export type ManualAdjustmentInput = z.infer<typeof manualAdjustmentSchema>;
