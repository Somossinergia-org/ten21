import { z } from "zod";

export const dataExportRequestSchema = z.object({
  type: z.enum(["FULL_EXPORT", "GDPR_EXPORT", "AUDIT_EXPORT"]),
  reason: z.string().max(500).optional(),
});

export const dataDeletionRequestSchema = z.object({
  type: z.enum(["CUSTOMER_DATA", "TENANT_DATA"]),
  targetEntityType: z.string().max(50).optional(),
  targetEntityId: z.string().optional(),
  reason: z.string().min(1, "La razon es obligatoria").max(1000),
});

export const approveDeletionSchema = z.object({
  requestId: z.string().min(1),
  approved: z.boolean(),
});
