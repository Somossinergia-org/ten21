"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Truck, ClipboardList,
  AlertTriangle, MapPin, Calendar, Users, BarChart3, Menu, X,
} from "lucide-react";
import type { Role } from "@prisma/client";

type NavItem = { label: string; href: string; roles: Role[]; icon: React.ReactNode };
type NavGroup = { title?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", roles: ["JEFE"], icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: "Compras",
    items: [
      { label: "Pedidos", href: "/purchases", roles: ["JEFE"], icon: <ShoppingCart size={18} /> },
      { label: "Productos", href: "/purchases/products", roles: ["JEFE"], icon: <Package size={18} /> },
      { label: "Proveedores", href: "/purchases/suppliers", roles: ["JEFE"], icon: <ClipboardList size={18} /> },
    ],
  },
  {
    title: "Almacen",
    items: [
      { label: "Recepcion", href: "/reception", roles: ["JEFE", "ALMACEN"], icon: <Package size={18} /> },
      { label: "Incidencias", href: "/incidents", roles: ["JEFE", "ALMACEN"], icon: <AlertTriangle size={18} /> },
    ],
  },
  {
    title: "Reparto",
    items: [
      { label: "Vehiculos", href: "/vehicles", roles: ["JEFE", "REPARTO"], icon: <Truck size={18} /> },
      { label: "Entregas", href: "/vehicles/deliveries", roles: ["JEFE", "REPARTO"], icon: <MapPin size={18} /> },
      { label: "Agenda", href: "/vehicles/deliveries/calendar", roles: ["JEFE", "REPARTO"], icon: <Calendar size={18} /> },
    ],
  },
  {
    title: "Configuracion",
    items: [
      { label: "Usuarios", href: "/settings/users", roles: ["JEFE"], icon: <Users size={18} /> },
      { label: "Estadisticas", href: "/settings/stats", roles: ["JEFE"], icon: <BarChart3 size={18} /> },
    ],
  },
];

function getVisibleGroups(role: Role): NavGroup[] {
  return navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const groups = getVisibleGroups(role);
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-6" : ""}>
          {group.title && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 rounded-xl border border-gray-200 bg-white p-2.5 shadow-lg lg:hidden"
        aria-label="Menu"
      >
        {open ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-60 flex-col bg-slate-900">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight">Ten21</span>
          </Link>
        </div>
        {nav}
        <div className="px-4 py-3 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 text-center">v1.0 — Somos Sinergia</p>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-900 shadow-2xl transition-transform duration-200 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight">Ten21</span>
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
