import { z } from "zod";

export const salesOrderLineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "La descripcion es obligatoria").max(500),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  unitSalePrice: z.number().min(0, "El precio no puede ser negativo"),
  unitExpectedCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente"),
  notes: z.string().max(1000).optional(),
  scheduledDeliveryDate: z.string().optional(),
  discountTotal: z.number().min(0).default(0),
  lines: z.array(salesOrderLineSchema).min(1, "Añade al menos una linea"),
});

export const updateSalesOrderSchema = z.object({
  id: z.string().min(1),
  notes: z.string().max(1000).optional(),
  scheduledDeliveryDate: z.string().optional(),
  discountTotal: z.number().min(0).optional(),
  lines: z.array(salesOrderLineSchema).min(1).optional(),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
export type SalesOrderLineInput = z.infer<typeof salesOrderLineSchema>;
