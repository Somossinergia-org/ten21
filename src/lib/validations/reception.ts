import { z } from "zod";

export const receptionLineInputSchema = z.object({
  purchaseOrderLineId: z.string().min(1),
  quantityExpected: z.coerce.number().int().min(0),
  quantityReceived: z.coerce.number().int().min(0, "La cantidad recibida no puede ser negativa"),
  quantityDamaged: z.coerce.number().int().min(0, "La cantidad dañada no puede ser negativa"),
  notes: z.string().max(500).optional(),
});

export const createReceptionSchema = z.object({
  purchaseOrderId: z.string().min(1, "El pedido es obligatorio"),
  deliveryNoteRef: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  lines: z.array(receptionLineInputSchema).min(1, "La recepcion debe tener al menos una linea"),
});

export type CreateReceptionInput = z.infer<typeof createReceptionSchema>;
export type ReceptionLineInput = z.infer<typeof receptionLineInputSchema>;
