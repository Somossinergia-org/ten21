import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as salesService from "@/services/sales.service";
import * as activityService from "@/services/activity.service";
import { SalesOrderActions } from "./sales-actions";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTIALLY_RESERVED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RESERVED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  IN_DELIVERY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador", CONFIRMED: "Confirmada", PARTIALLY_RESERVED: "Reserva parcial",
  RESERVED: "Reservada", IN_DELIVERY: "En entrega", DELIVERED: "Entregada", CANCELLED: "Cancelada",
};

export default async function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const { id } = await params;

  const order = await salesService.getSalesOrder(id, tenantId);
  if (!order) notFound();

  const logs = await activityService.listForEntity(tenantId, "SalesOrder", id);

  return (
    <div>
      <Link href="/sales" className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 mb-4"><ArrowLeft size={12} /> Volver a ventas</Link>

      <div className="flex items-center gap-3 mb-6">
        <PageHeader title={order.orderNumber} />
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lines */}
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Lineas de venta</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-600">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2 text-center">Cant</th>
                    <th className="pb-2 text-right">PVP</th>
                    <th className="pb-2 text-right">Coste</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2d4a]">
                  {order.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2 text-slate-300">
                        {line.product ? <span className="font-mono text-xs text-cyan-500">{line.product.ref}</span> : null}
                        {" "}{line.description}
                      </td>
                      <td className="py-2 text-center text-slate-400">{line.quantity}</td>
                      <td className="py-2 text-right font-mono text-slate-300">{Number(line.unitSalePrice).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-slate-500">{line.unitExpectedCost ? Number(line.unitExpectedCost).toFixed(2) : "—"}</td>
                      <td className="py-2 text-right font-mono text-slate-200">{Number(line.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1a2d4a] flex justify-end gap-6 text-sm">
              <span className="text-slate-500">Subtotal: <span className="text-slate-300 font-mono">{Number(order.subtotal).toFixed(2)} &euro;</span></span>
              {Number(order.discountTotal) > 0 && <span className="text-slate-500">Dto: <span className="text-red-400 font-mono">-{Number(order.discountTotal).toFixed(2)}</span></span>}
              <span className="text-cyan-500 font-bold">Total: <span className="font-mono">{Number(order.total).toFixed(2)} &euro;</span></span>
              {order.estimatedMargin && <span className="text-slate-500">Margen: <span className={`font-mono ${Number(order.estimatedMargin) >= 0 ? "text-emerald-400" : "text-red-400"}`}>{Number(order.estimatedMargin).toFixed(2)}</span></span>}
            </div>
          </div>

          {/* Deliveries */}
          {order.deliveries.length > 0 && (
            <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Entregas vinculadas</h3>
              {order.deliveries.map((d) => (
                <Link key={d.id} href={`/vehicles/deliveries/${d.id}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                  {d.deliveryNumber} — <span className="text-slate-500">{d.status}</span>
                </Link>
              ))}
            </div>
          )}

          {/* PostSale tickets */}
          {order.postSaleTickets.length > 0 && (
            <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Tickets posventa</h3>
              {order.postSaleTickets.map((t) => (
                <Link key={t.id} href={`/post-sales/${t.id}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                  {t.ticketNumber} — {t.type} — <span className="text-slate-500">{t.status}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Timeline */}
          <ActivityTimeline logs={logs} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Datos</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-slate-500">Cliente:</span> <Link href={`/customers/${order.customerId}`} className="text-cyan-400 hover:text-cyan-300">{order.customer.fullName}</Link></div>
              <div><span className="text-slate-500">Creado por:</span> <span className="text-slate-300">{order.createdBy.name}</span></div>
              <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-300">{new Date(order.createdAt).toLocaleDateString("es-ES")}</span></div>
              {order.scheduledDeliveryDate && <div><span className="text-slate-500">Entrega prevista:</span> <span className="text-slate-300">{new Date(order.scheduledDeliveryDate).toLocaleDateString("es-ES")}</span></div>}
              {order.confirmedAt && <div><span className="text-slate-500">Confirmada:</span> <span className="text-slate-300">{new Date(order.confirmedAt).toLocaleDateString("es-ES")}</span></div>}
              {order.notes && <div className="pt-2 border-t border-[#1a2d4a]"><p className="text-slate-400">{order.notes}</p></div>}
            </div>
          </div>

          <SalesOrderActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </div>
  );
}
