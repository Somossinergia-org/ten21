"use client";

import Link from "next/link";
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
  openIncidents?: number;
};

export function Header({ userName, userRole, tenantName, openIncidents = 0 }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="text-sm text-gray-500 hidden sm:block">
        {tenantName}
      </div>
      <div className="sm:hidden" />

      <div className="flex items-center gap-3">
        {/* Notification badge */}
        {openIncidents > 0 && (
          <Link
            href="/incidents?status=REGISTERED"
            className="relative flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {openIncidents} incidencia{openIncidents !== 1 ? "s" : ""}
          </Link>
        )}

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
