import { z } from "zod";

export const tenantConfigSchema = z.object({
  businessName: z.string().min(1, "El nombre es obligatorio").max(200),
  tradeName: z.string().max(200).optional(),
  taxId: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().max(5).default("ES"),
  timezone: z.string().max(50).default("Europe/Madrid"),
  currency: z.string().max(5).default("EUR"),
  language: z.string().max(5).default("es"),
});

export const tenantBrandingSchema = z.object({
  appName: z.string().max(100).optional(),
  heroText: z.string().max(200).optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
});

export const toggleModuleSchema = z.object({
  moduleCode: z.string().min(1),
  enabled: z.boolean(),
});

export type TenantConfigInput = z.infer<typeof tenantConfigSchema>;
export type TenantBrandingInput = z.infer<typeof tenantBrandingSchema>;
