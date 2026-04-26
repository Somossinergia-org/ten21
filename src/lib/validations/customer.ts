import { z } from "zod";

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio").max(200),
  phone: z.string().max(30).optional().default(""),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  addressLine1: z.string().min(1, "La dirección es obligatoria").max(500),
  addressLine2: z.string().max(500).optional().default(""),
  city: z.string().max(100).optional().default(""),
  postalCode: z.string().max(10).optional().default(""),
  province: z.string().max(100).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
