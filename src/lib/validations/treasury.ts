import { z } from "zod";

export const createManualTreasurySchema = z.object({
  type: z.enum(["INCOME_EXPECTED", "INCOME_CONFIRMED", "EXPENSE_EXPECTED", "EXPENSE_CONFIRMED"]),
  concept: z.string().min(1, "El concepto es obligatorio").max(500),
  amount: z.number().min(0.01, "El importe debe ser positivo"),
  dueDate: z.string().optional(),
  category: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const markTreasuryPaidSchema = z.object({
  entryId: z.string().min(1),
  paidDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateManualTreasuryInput = z.infer<typeof createManualTreasurySchema>;
