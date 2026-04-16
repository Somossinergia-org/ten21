import { z } from "zod";

export const customerInvoiceLineSchema = z.object({
  salesOrderLineId: z.string().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100).default(21),
});

export const createCustomerInvoiceSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente"),
  salesOrderId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  lines: z.array(customerInvoiceLineSchema).min(1, "Añade al menos una linea"),
});

export const markInvoicePaidSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01, "El importe debe ser positivo"),
  paidDate: z.string().optional(),
});

export type CreateCustomerInvoiceInput = z.infer<typeof createCustomerInvoiceSchema>;
