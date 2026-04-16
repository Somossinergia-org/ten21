import { z } from "zod";

export const deliveryLineInputSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "La descripcion es obligatoria").max(500),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().max(500).optional(),
});

export const createDeliverySchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "El nombre del cliente es obligatorio").max(200),
  customerPhone: z.string().max(30).optional(),
  customerAddress: z.string().min(1, "La direccion es obligatoria").max(500),
  description: z.string().min(1, "Describe que se entrega").max(1000),
  scheduledDate: z.string().optional(),
  vehicleId: z.string().min(1, "Selecciona un vehiculo"),
  assignedToId: z.string().min(1, "Selecciona un repartidor"),
  notes: z.string().max(1000).optional(),
  lines: z.array(deliveryLineInputSchema).optional(),
});

export const startDeliverySchema = z.object({
  deliveryId: z.string().min(1),
  startKm: z.coerce.number().int().min(0).optional(),
});

export const completeDeliverySchema = z.object({
  deliveryId: z.string().min(1),
  endKm: z.coerce.number().int().min(0).optional(),
  failed: z.boolean().default(false),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
