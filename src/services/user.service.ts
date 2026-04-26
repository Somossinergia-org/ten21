import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function listUsers(tenantId: string) {
  return db.user.findMany({
    where: { tenantId },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { name: "asc" },
  });
}

export async function createUser(
  tenantId: string,
  data: { name: string; email: string; password: string; role: Role },
) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      tenantId,
    },
  });
}

export async function changePassword(userId: string, tenantId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return db.user.updateMany({
    where: { id: userId, tenantId },
    data: { password: hashedPassword },
  });
}

export async function toggleUserActive(userId: string, tenantId: string) {
  const user = await db.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new Error("Usuario no encontrado");
  return db.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });
}
