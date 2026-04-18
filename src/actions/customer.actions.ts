"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as customerService from "@/services/customer.service";
import * as activity from "@/services/activity.service";
import { createCustomerSchema, updateCustomerSchema } from "@/lib/validations/customer";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createCustomerAction(data: {
  fullName: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = createCustomerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const customer = await customerService.createCustomer(parsed.data, tenantId);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "customer.created", entity: "Customer",
      entityId: customer.id, entityRef: customer.fullName,
      details: { phone: customer.phone, city: data.city },
    });
    revalidatePath("/customers");
    return { success: true, id: customer.id };
  } catch {
    return { success: false, error: "Error al crear el cliente" };
  }
}

export async function updateCustomerAction(data: {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const parsed = updateCustomerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const customer = await customerService.updateCustomer(parsed.data, tenantId);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "customer.updated", entity: "Customer",
      entityId: customer.id, entityRef: customer.fullName,
    });
    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el cliente" };
  }
}

export async function toggleCustomerActiveAction(id: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  try {
    await customerService.toggleCustomerActive(id, tenantId);
    revalidatePath("/customers");
    return { success: true };
  } catch {
    return { success: false, error: "Error al cambiar estado del cliente" };
  }
}
