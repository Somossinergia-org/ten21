"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";

type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", roles: ["JEFE"] },
    ],
  },
  {
    title: "Compras",
    items: [
      { label: "Pedidos", href: "/purchases", roles: ["JEFE"] },
      { label: "Productos", href: "/purchases/products", roles: ["JEFE"] },
      { label: "Proveedores", href: "/purchases/suppliers", roles: ["JEFE"] },
    ],
  },
  {
    title: "Almacen",
    items: [
      { label: "Recepcion", href: "/reception", roles: ["JEFE", "ALMACEN"] },
      { label: "Incidencias", href: "/incidents", roles: ["JEFE", "ALMACEN"] },
    ],
  },
  {
    title: "Reparto",
    items: [
      { label: "Vehiculos", href: "/vehicles", roles: ["JEFE", "REPARTO"] },
      { label: "Entregas", href: "/vehicles/deliveries", roles: ["JEFE", "REPARTO"] },
      { label: "Agenda", href: "/vehicles/deliveries/calendar", roles: ["JEFE", "REPARTO"] },
    ],
  },
];

function getVisibleGroups(role: Role): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const groups = getVisibleGroups(role);
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-2 py-3">
      {groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-4" : ""}>
          {group.title && (
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
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
        className="fixed top-3 left-3 z-50 rounded-md border border-gray-300 bg-white p-2 shadow-sm lg:hidden"
        aria-label="Menu"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link href="/" className="text-lg font-bold text-gray-900">Ten21</Link>
        </div>
        {nav}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-lg font-bold text-gray-900">
            Ten21
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
