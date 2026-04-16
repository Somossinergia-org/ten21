"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import * as activity from "@/services/activity.service";
import * as notifService from "@/services/notification.service";
import { reconcileInvoiceSchema } from "@/lib/validations/invoice-reconciliation";

type ActionResult = { success: boolean; error?: string };

export async function reconcileInvoiceAction(data: {
  invoiceId: string;
  purchaseOrderId: string;
  mismatchReason?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = reconcileInvoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const invoice = await db.supplierInvoice.findFirst({
      where: { id: parsed.data.invoiceId, tenantId },
    });
    if (!invoice) return { success: false, error: "Factura no encontrada" };

    const po = await db.purchaseOrder.findFirst({
      where: { id: parsed.data.purchaseOrderId, tenantId },
      include: { lines: true },
    });
    if (!po) return { success: false, error: "Pedido no encontrado" };

    // Basic reconciliation: compare total amounts
    const poTotal = po.lines.reduce((sum, l) => {
      const cost = l.expectedUnitCost ? Number(l.expectedUnitCost) : 0;
      return sum + cost * l.quantityOrdered;
    }, 0);

    const invoiceTotal = invoice.totalAmount ? Number(invoice.totalAmount) : 0;
    const diff = Math.abs(poTotal - invoiceTotal);
    const isMatch = diff < 0.01; // Tolerance for float comparison

    const reconciliationStatus = isMatch ? "MATCHED" : "MISMATCHED";
    const mismatchReason = isMatch
      ? null
      : (parsed.data.mismatchReason || `Diferencia de ${diff.toFixed(2)}€ (pedido: ${poTotal.toFixed(2)}€, factura: ${invoiceTotal.toFixed(2)}€)`);

    await db.supplierInvoice.update({
      where: { id: parsed.data.invoiceId },
      data: {
        purchaseOrderId: parsed.data.purchaseOrderId,
        reconciliationStatus,
        mismatchReason,
        status: isMatch ? "VALIDATED" : "MISMATCH",
      },
    });

    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "invoice.reconciled", entity: "SupplierInvoice",
      entityId: parsed.data.invoiceId,
      entityRef: invoice.invoiceNumber || undefined,
      details: { reconciliationStatus, purchaseOrderId: po.id, orderNumber: po.orderNumber },
    });

    if (!isMatch) {
      await notifService.notifyInvoiceMismatch(
        tenantId,
        invoice.invoiceNumber || "Sin número",
        mismatchReason || "Discrepancia detectada",
        invoice.id,
      );
    }

    revalidatePath("/settings/finance");
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false, error: "Error al conciliar la factura" };
  }
}
