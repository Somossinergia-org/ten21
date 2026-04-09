import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  code: z.string().min(1, "El codigo es obligatorio").max(50),
  phone: z.string().max(30).optional(),
  email: z.string().email("Email no valido").optional().or(z.literal("")),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
