"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import { createProductSchema } from "@/lib/validations/product";
import { createSupplierSchema } from "@/lib/validations/supplier";
import { createPurchaseOrderSchema } from "@/lib/validations/purchase";
import * as purchaseService from "@/services/purchase.service";

type ActionResult = {
  success: boolean;
  error?: string;
};

// ============================================================
// PRODUCTS
// ============================================================

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const raw = {
    ref: formData.get("ref"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  };

  const parsed = createProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await purchaseService.createProduct(parsed.data, tenantId);
    revalidatePath("/purchases");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { success: false, error: "Ya existe un producto con esa referencia" };
    }
    return { success: false, error: "Error al crear el producto" };
  }
}

// ============================================================
// SUPPLIERS
// ============================================================

export async function createSupplierAction(formData: FormData): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const raw = {
    name: formData.get("name"),
    code: formData.get("code"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  };

  const parsed = createSupplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await purchaseService.createSupplier(parsed.data, tenantId);
    revalidatePath("/purchases");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { success: false, error: "Ya existe un proveedor con ese codigo" };
    }
    return { success: false, error: "Error al crear el proveedor" };
  }
}

// ============================================================
// PURCHASE ORDERS
// ============================================================

export async function createPurchaseOrderAction(data: {
  supplierId: string;
  type: "SALE" | "EXHIBITION";
  notes?: string;
  lines: { productId: string; quantityOrdered: number; expectedUnitCost?: number }[];
}): Promise<ActionResult & { orderId?: string }> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const user = await getCurrentUser();

  const parsed = createPurchaseOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const order = await purchaseService.createPurchaseOrder(parsed.data, tenantId, user.id);
    revalidatePath("/purchases");
    return { success: true, orderId: order.id };
  } catch {
    return { success: false, error: "Error al crear el pedido" };
  }
}

export async function sendPurchaseOrderAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  try {
    await purchaseService.updatePurchaseOrderStatus(id, tenantId, "SENT");
    revalidatePath(`/purchases/${id}`);
    revalidatePath("/purchases");
    return { success: true };
  } catch {
    return { success: false, error: "Error al enviar el pedido" };
  }
}
