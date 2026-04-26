"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createManualTreasurySchema, markTreasuryPaidSchema } from "@/lib/validations/treasury";
import * as treasuryService from "@/services/treasury.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function createManualTreasuryAction(data: {
  type: string;
  concept: string;
  amount: number;
  dueDate?: string;
  category?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createManualTreasurySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const entry = await treasuryService.createEntry(tenantId, {
      ...parsed.data,
      type: parsed.data.type as "INCOME_EXPECTED" | "INCOME_CONFIRMED" | "EXPENSE_EXPECTED" | "EXPENSE_CONFIRMED",
      createdById: me.id,
    });
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "stock.manual_adjustment", entity: "ProductInventory",
      entityId: entry.id,
      details: { type: entry.type, amount: Number(entry.amount), concept: entry.concept },
    });
    revalidatePath("/finance/treasury");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function markTreasuryPaidAction(data: {
  entryId: string;
  paidDate?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = markTreasuryPaidSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await treasuryService.markAsPaid(parsed.data.entryId, tenantId, parsed.data.paidDate, parsed.data.notes);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "invoice.reconciled", entity: "SupplierInvoice",
      entityId: parsed.data.entryId,
      details: { action: "treasury_paid" },
    });
    revalidatePath("/finance/treasury");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
