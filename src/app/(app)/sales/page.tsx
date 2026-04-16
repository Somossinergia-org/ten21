import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as salesService from "@/services/sales.service";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PARTIALLY_RESERVED: "bg-amber-500/10 text-amber-400",
  RESERVED: "bg-cyan-500/10 text-cyan-400",
  IN_DELIVERY: "bg-purple-500/10 text-purple-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmada",
  PARTIALLY_RESERVED: "Reserva parcial",
  RESERVED: "Reservada",
  IN_DELIVERY: "En entrega",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export default async function SalesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const orders = await salesService.listSalesOrders(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Ventas" />
        <Link href="/sales/new" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition-colors">
          Nueva venta
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">N. Venta</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 text-center">Lineas</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">No hay ventas registradas</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/sales/${o.id}`} className="font-mono font-medium text-cyan-400 hover:text-cyan-300">{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{o.customer.fullName}</td>
                <td className="px-4 py-3 text-center text-slate-400">{o._count.lines}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-300">{Number(o.total).toFixed(2)} &euro;</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[o.status] || ""}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
