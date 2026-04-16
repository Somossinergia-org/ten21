"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { manualAdjustmentSchema } from "@/lib/validations/inventory";
import * as inventoryService from "@/services/inventory.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function manualAdjustmentAction(data: {
  productId: string;
  quantity: number;
  notes: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = manualAdjustmentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const result = await inventoryService.manualAdjustment(
      tenantId, parsed.data.productId, parsed.data.quantity,
      parsed.data.notes, me.id,
    );
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "stock.manual_adjustment", entity: "ProductInventory",
      entityId: parsed.data.productId,
      details: { quantity: parsed.data.quantity, notes: parsed.data.notes, newOnHand: result.newOnHand },
    });
    revalidatePath("/inventory");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al ajustar stock" };
  }
}
