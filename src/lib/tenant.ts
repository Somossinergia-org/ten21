import { redirect } from "next/navigation";
import { getSession } from "./auth";
import type { Role } from "@prisma/client";

const defaultPageByRole: Record<Role, string> = {
  JEFE: "/dashboard",
  ALMACEN: "/reception",
  REPARTO: "/vehicles",
};

/**
 * Get the current authenticated user's session.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require the current user to have one of the specified roles.
 * Redirects to /login if not authenticated.
 * Redirects to the user's default page if role is not allowed.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect(defaultPageByRole[session.user.role]);
  }
  return session;
}

/**
 * Extract the tenantId from the current session.
 * Redirects to /login if not authenticated.
 */
export async function getTenantId(): Promise<string> {
  const session = await requireAuth();
  return session.user.tenantId;
}

/**
 * Get the full current user object from the session.
 * Redirects to /login if not authenticated.
 */
export async function getCurrentUser() {
  const session = await requireAuth();
  return session.user;
}

/**
 * Helper to build a Prisma where clause filtered by tenant.
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (!session.user.isSuperAdmin) {
    redirect(defaultPageByRole[session.user.role]);
  }
  return session;
}

export function tenantWhere(tenantId: string) {
  return { tenantId };
}
