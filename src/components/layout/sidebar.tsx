"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Truck, ClipboardList,
  AlertTriangle, MapPin, Calendar, Users, BarChart3, Menu, X, Brain, Wallet,
  UserCircle, Bell, Receipt, Warehouse, HeadsetIcon, Gauge, TrendingUp, FileText,
  Smartphone, Zap,
} from "lucide-react";
import type { Role } from "@prisma/client";

type NavItem = { label: string; href: string; roles: Role[]; icon: React.ReactNode };
type NavGroup = { title?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { items: [
    { label: "Dashboard", href: "/dashboard", roles: ["JEFE"], icon: <LayoutDashboard size={16} /> },
    { label: "Cockpit", href: "/executive", roles: ["JEFE"], icon: <Gauge size={16} /> },
  ]},
  { title: "Ventas", items: [
    { label: "Ventas", href: "/sales", roles: ["JEFE"], icon: <Receipt size={16} /> },
    { label: "Clientes", href: "/customers", roles: ["JEFE"], icon: <UserCircle size={16} /> },
    { label: "Posventa", href: "/post-sales", roles: ["JEFE"], icon: <HeadsetIcon size={16} /> },
  ]},
  { title: "Compras", items: [
    { label: "Pedidos", href: "/purchases", roles: ["JEFE"], icon: <ShoppingCart size={16} /> },
    { label: "Productos", href: "/purchases/products", roles: ["JEFE"], icon: <Package size={16} /> },
    { label: "Proveedores", href: "/purchases/suppliers", roles: ["JEFE"], icon: <ClipboardList size={16} /> },
  ]},
  { title: "Almacen", items: [
    { label: "Inventario", href: "/inventory", roles: ["JEFE", "ALMACEN"], icon: <Warehouse size={16} /> },
    { label: "Recepcion", href: "/reception", roles: ["JEFE", "ALMACEN"], icon: <Package size={16} /> },
    { label: "Incidencias", href: "/incidents", roles: ["JEFE", "ALMACEN"], icon: <AlertTriangle size={16} /> },
  ]},
  { title: "Reparto", items: [
    { label: "Vehiculos", href: "/vehicles", roles: ["JEFE", "REPARTO"], icon: <Truck size={16} /> },
    { label: "Entregas", href: "/vehicles/deliveries", roles: ["JEFE", "REPARTO"], icon: <MapPin size={16} /> },
    { label: "Agenda", href: "/vehicles/deliveries/calendar", roles: ["JEFE", "REPARTO"], icon: <Calendar size={16} /> },
    { label: "Movil reparto", href: "/mobile/reparto", roles: ["REPARTO", "JEFE"], icon: <Smartphone size={16} /> },
    { label: "Movil almacen", href: "/mobile/almacen", roles: ["ALMACEN", "JEFE"], icon: <Smartphone size={16} /> },
  ]},
  { title: "Sistema", items: [
    { label: "Automatizaciones", href: "/automations", roles: ["JEFE"], icon: <Zap size={16} /> },
    { label: "Notificaciones", href: "/notifications", roles: ["JEFE", "ALMACEN", "REPARTO"], icon: <Bell size={16} /> },
    { label: "Tesoreria", href: "/finance/treasury", roles: ["JEFE"], icon: <Wallet size={16} /> },
    { label: "Facturas cliente", href: "/finance/invoices", roles: ["JEFE"], icon: <FileText size={16} /> },
    { label: "Rentabilidad", href: "/finance/profitability", roles: ["JEFE"], icon: <TrendingUp size={16} /> },
    { label: "Fact. proveedor", href: "/settings/finance", roles: ["JEFE"], icon: <Wallet size={16} /> },
    { label: "Inteligencia IA", href: "/settings/ai", roles: ["JEFE"], icon: <Brain size={16} /> },
    { label: "Usuarios", href: "/settings/users", roles: ["JEFE"], icon: <Users size={16} /> },
    { label: "Estadisticas", href: "/settings/stats", roles: ["JEFE"], icon: <BarChart3 size={16} /> },
  ]},
];

function getVisibleGroups(role: Role) {
  return navGroups.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length > 0);
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const groups = getVisibleGroups(role);
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-5" : ""}>
          {group.title && (
            <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/50">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 glow-cyan"
                      : "text-slate-500 hover:text-cyan-300 hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-cyan-400" : "text-slate-600"}>{item.icon}</span>
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
      <button onClick={() => setOpen(!open)} className="fixed top-3 left-3 z-50 rounded-lg bg-[#0a1628] border border-[#1a2d4a] p-2.5 shadow-lg lg:hidden" aria-label="Menu">
        {open ? <X size={18} className="text-cyan-400" /> : <Menu size={18} className="text-cyan-400" />}
      </button>
      {open && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Desktop */}
      <aside className="hidden lg:flex h-full w-56 flex-col bg-[#050a14] border-r border-[#1a2d4a]">
        <div className="flex h-14 items-center px-5 border-b border-[#1a2d4a]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center animate-glow">
              <span className="text-white font-black text-[11px]">TM</span>
            </div>
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">TodoMueble</span>
          </Link>
        </div>
        {nav}
      </aside>

      {/* Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#050a14] border-r border-[#1a2d4a] shadow-2xl transition-transform duration-200 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center px-5 border-b border-[#1a2d4a]">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-black text-[11px]">TM</span>
            </div>
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">TodoMueble</span>
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
