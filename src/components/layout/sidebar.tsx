"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["JEFE"],
  },
  {
    label: "Compras",
    href: "/purchases",
    roles: ["JEFE"],
  },
  {
    label: "Recepcion",
    href: "/reception",
    roles: ["JEFE", "ALMACEN"],
  },
  {
    label: "Incidencias",
    href: "/incidents",
    roles: ["JEFE", "ALMACEN"],
  },
  {
    label: "Vehiculos",
    href: "/vehicles",
    roles: ["JEFE", "REPARTO"],
  },
];

function getVisibleItems(role: Role): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = getVisibleItems(role);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          Ten21
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
    </aside>
  );
}
