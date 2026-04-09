"use client";

import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";

const roleLabels: Record<Role, string> = {
  JEFE: "Jefe",
  ALMACEN: "Almacen",
  REPARTO: "Reparto",
};

type HeaderProps = {
  userName: string;
  userRole: Role;
  tenantName: string;
};

export function Header({ userName, userRole, tenantName }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-sm text-gray-500">
        {tenantName}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{roleLabels[userRole]}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
