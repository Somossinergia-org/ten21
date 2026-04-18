import { z } from "zod";

export const reconciliationStatusEnum = z.enum([
  "NOT_CHECKED",
  "MATCHED",
  "MISMATCHED",
]);

export const reconcileInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  purchaseOrderId: z.string().min(1),
  mismatchReason: z.string().max(1000).optional().default(""),
});

export type ReconcileInvoiceInput = z.infer<typeof reconcileInvoiceSchema>;
