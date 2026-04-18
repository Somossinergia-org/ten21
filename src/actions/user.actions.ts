"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getTenantId, getCurrentUser } from "@/lib/tenant";
import * as userService from "@/services/user.service";
import * as activity from "@/services/activity.service";
import type { Role } from "@prisma/client";

type ActionResult = { success: boolean; error?: string };

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  if (!data.name || !data.email || !data.password) {
    return { success: false, error: "Todos los campos son obligatorios" };
  }
  if (data.password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  try {
    const user = await userService.createUser(tenantId, data);
    await activity.log({
      tenantId, userId: me.id, userName: me.name,
      action: "user.created", entity: "User",
      entityId: user.id, entityRef: user.email,
      details: { name: user.name, role: user.role },
    });
    revalidatePath("/settings/users");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { success: false, error: "Ya existe un usuario con ese email" };
    }
    return { success: false, error: "Error al crear el usuario" };
  }
}

export async function changePasswordAction(data: {
  userId: string;
  newPassword: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  if (!data.newPassword || data.newPassword.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  try {
    await userService.changePassword(data.userId, tenantId, data.newPassword);
    return { success: true };
  } catch {
    return { success: false, error: "Error al cambiar la contraseña" };
  }
}

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  try {
    await userService.toggleUserActive(userId, tenantId);
    revalidatePath("/settings/users");
    return { success: true };
  } catch {
    return { success: false, error: "Error al cambiar estado del usuario" };
  }
}
