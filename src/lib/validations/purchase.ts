import { z } from "zod";

export const purchaseOrderLineSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio"),
  quantityOrdered: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  expectedUnitCost: z.coerce.number().min(0, "El coste no puede ser negativo").optional(),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "El proveedor es obligatorio"),
  type: z.enum(["SALE", "EXHIBITION"]),
  notes: z.string().max(1000).optional(),
  lines: z.array(purchaseOrderLineSchema).min(1, "El pedido debe tener al menos una linea"),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type PurchaseOrderLineInput = z.infer<typeof purchaseOrderLineSchema>;
