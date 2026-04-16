"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { GlobalSearch } from "./global-search";
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
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Left: tenant */}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-gray-900">{tenantName}</p>
      </div>
      <div className="sm:hidden w-10" /> {/* Spacer for hamburger */}

      {/* Center: search */}
      <div className="flex-1 flex justify-center px-4">
        <GlobalSearch />
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        {openIncidents > 0 && (
          <Link
            href="/incidents?status=REGISTERED"
            className="relative flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            <Bell size={14} />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="hidden sm:inline">{openIncidents}</span>
          </Link>
        )}

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{userName.charAt(0)}</span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
            <p className="text-[10px] text-gray-500 font-medium">{roleLabels[userRole]}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
            title="Cerrar sesion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
