"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createSalesOrderSchema } from "@/lib/validations/sales";
import * as salesService from "@/services/sales.service";
import * as activity from "@/services/activity.service";

type ActionResult = { success: boolean; error?: string };

export async function createSalesOrderAction(data: {
  customerId: string;
  notes?: string;
  scheduledDeliveryDate?: string;
  discountTotal?: number;
  lines: { productId?: string; description: string; quantity: number; unitSalePrice: number; unitExpectedCost?: number; notes?: string }[];
}): Promise<ActionResult & { orderId?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createSalesOrderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const order = await salesService.createSalesOrder(parsed.data, tenantId, me.id);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "sale.created", entity: "SalesOrder",
      entityId: order.id, entityRef: order.orderNumber,
      details: { lines: order.lines.length, total: Number(order.total) },
    });
    revalidatePath("/sales");
    return { success: true, orderId: order.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear la venta" };
  }
}

export async function confirmSalesOrderAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const order = await salesService.confirmSalesOrder(id, tenantId);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "sale.confirmed", entity: "SalesOrder",
      entityId: id, entityRef: order.orderNumber,
      details: { newStatus: order.status },
    });
    revalidatePath("/sales");
    revalidatePath(`/sales/${id}`);
    revalidatePath("/inventory");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al confirmar" };
  }
}

export async function cancelSalesOrderAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  try {
    const order = await salesService.cancelSalesOrder(id, tenantId);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "sale.cancelled", entity: "SalesOrder",
      entityId: id, entityRef: order.orderNumber,
    });
    revalidatePath("/sales");
    revalidatePath(`/sales/${id}`);
    revalidatePath("/inventory");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al cancelar" };
  }
}
