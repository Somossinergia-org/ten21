"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createCustomerInvoiceSchema, markInvoicePaidSchema } from "@/lib/validations/customer-invoice";
import * as invoiceService from "@/services/customer-invoice.service";
import * as treasuryService from "@/services/treasury.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function createCustomerInvoiceAction(data: {
  customerId: string;
  salesOrderId?: string;
  dueDate?: string;
  notes?: string;
  lines: { salesOrderLineId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }[];
}): Promise<ActionResult & { invoiceId?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createCustomerInvoiceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const invoice = await invoiceService.createInvoice(parsed.data, tenantId, me.id);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "invoice.created", entity: "CustomerInvoice" as "SupplierInvoice",
      entityId: invoice.id, entityRef: invoice.invoiceNumber,
      details: { total: Number(invoice.total), customerId: data.customerId },
    });
    revalidatePath("/finance/invoices");
    return { success: true, invoiceId: invoice.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear factura" };
  }
}

export async function issueCustomerInvoiceAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const invoice = await invoiceService.issueInvoice(id, tenantId);

    // Create treasury entry for expected income
    await treasuryService.createFromCustomerInvoice(
      tenantId, invoice.id,
      `Factura ${invoice.invoiceNumber}`,
      Number(invoice.total),
      invoice.dueDate || undefined,
    );

    // Update linked SalesOrder
    if (invoice.salesOrderId) {
      const { db } = await import("@/lib/db");
      await db.salesOrder.update({
        where: { id: invoice.salesOrderId },
        data: { paymentStatus: "BILLED" },
      });
    }

    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "invoice.created", entity: "CustomerInvoice" as "SupplierInvoice",
      entityId: id, entityRef: invoice.invoiceNumber,
      details: { action: "issued", total: Number(invoice.total) },
    });
    revalidatePath("/finance");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al emitir" };
  }
}

export async function recordPaymentAction(data: {
  invoiceId: string;
  amount: number;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = markInvoicePaidSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const invoice = await invoiceService.recordPayment(parsed.data.invoiceId, tenantId, parsed.data.amount);

    if (invoice.status === "PAID") {
      // Mark treasury entry as confirmed
      const entries = await (await import("@/lib/db")).db.treasuryEntry.findMany({
        where: { tenantId, sourceType: "CUSTOMER_INVOICE", sourceId: invoice.id, status: { not: "PAID" } },
      });
      for (const e of entries) {
        await treasuryService.markAsPaid(e.id, tenantId);
      }

      // Update SalesOrder payment status
      if (invoice.salesOrderId) {
        await (await import("@/lib/db")).db.salesOrder.update({
          where: { id: invoice.salesOrderId },
          data: { paymentStatus: "PAID" },
        });
      }
    }

    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "invoice.reconciled", entity: "CustomerInvoice" as "SupplierInvoice",
      entityId: parsed.data.invoiceId,
      details: { amount: parsed.data.amount, newStatus: invoice.status },
    });
    revalidatePath("/finance");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al registrar cobro" };
  }
}
