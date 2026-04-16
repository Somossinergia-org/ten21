import { requireRole, getTenantId } from "@/lib/tenant";
import * as userService from "@/services/user.service";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const users = await userService.listUsers(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
      <p className="mt-1 text-sm text-gray-500">Gestion de usuarios del sistema</p>
      <UsersClient users={users} />
    </div>
  );
}
