"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { GlobalSearch } from "./global-search";
import type { Role } from "@prisma/client";

const roleLabels: Record<Role, string> = { JEFE: "Jefe", ALMACEN: "Almacen", REPARTO: "Reparto" };

type HeaderProps = { userName: string; userRole: Role; tenantName: string; openIncidents?: number };

export function Header({ userName, userRole, tenantName, openIncidents = 0 }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#1a2d4a] bg-[#050a14]/80 backdrop-blur-md px-4 lg:px-6">
      <div className="hidden sm:block">
        <p className="text-xs font-semibold text-slate-500">{tenantName}</p>
      </div>
      <div className="sm:hidden w-10" />

      <div className="flex-1 flex justify-center px-4">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        {openIncidents > 0 && (
          <Link href="/incidents?status=REGISTERED"
            className="relative flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors">
            <Bell size={13} />
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span className="hidden sm:inline">{openIncidents}</span>
          </Link>
        )}

        <div className="flex items-center gap-2.5 rounded-lg bg-[#0a1628] border border-[#1a2d4a] px-3 py-1.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">{userName.charAt(0)}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-300 leading-tight">{userName}</p>
            <p className="text-[10px] text-cyan-600">{roleLabels[userRole]}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-slate-600 hover:text-red-400 transition-colors" title="Salir">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
