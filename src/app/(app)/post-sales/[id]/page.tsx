import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as postsaleService from "@/services/postsale.service";
import * as activityService from "@/services/activity.service";
import { PostSaleActions } from "./postsale-actions";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  WAITING_SUPPLIER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const priorityLabels: Record<string, string> = { LOW: "Baja", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente" };
const typeLabels: Record<string, string> = {
  DAMAGE: "Daño", MISSING_ITEM: "Falta pieza", INSTALLATION: "Instalacion",
  WARRANTY: "Garantia", RETURN: "Devolucion", OTHER: "Otro",
};

export default async function PostSaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const { id } = await params;

  const ticket = await postsaleService.getTicket(id, tenantId);
  if (!ticket) notFound();

  const logs = await activityService.listForEntity(tenantId, "PostSaleTicket", id);

  return (
    <div>
      <Link href="/post-sales" className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 mb-4"><ArrowLeft size={12} /> Volver a posventa</Link>

      <div className="flex items-center gap-3 mb-6">
        <PageHeader title={ticket.ticketNumber} />
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status]}`}>{ticket.status}</span>
        <span className={`text-xs font-medium ${ticket.priority === "URGENT" ? "text-red-400" : ticket.priority === "HIGH" ? "text-amber-400" : "text-slate-500"}`}>
          {priorityLabels[ticket.priority]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-2">Descripcion</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.resolution && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500/50 mb-2">Resolucion</h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.resolution}</p>
            </div>
          )}

          <ActivityTimeline logs={logs} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Datos</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-slate-500">Tipo:</span> <span className="text-slate-300">{typeLabels[ticket.type]}</span></div>
              <div><span className="text-slate-500">Cliente:</span> <Link href={`/customers/${ticket.customerId}`} className="text-cyan-400">{ticket.customer.fullName}</Link></div>
              {ticket.salesOrder && <div><span className="text-slate-500">Venta:</span> <Link href={`/sales/${ticket.salesOrder.id}`} className="text-cyan-400">{ticket.salesOrder.orderNumber}</Link></div>}
              {ticket.delivery && <div><span className="text-slate-500">Entrega:</span> <Link href={`/vehicles/deliveries/${ticket.delivery.id}`} className="text-cyan-400">{ticket.delivery.deliveryNumber}</Link></div>}
              <div><span className="text-slate-500">Creado por:</span> <span className="text-slate-300">{ticket.createdBy.name}</span></div>
              {ticket.assignedTo && <div><span className="text-slate-500">Asignado:</span> <span className="text-slate-300">{ticket.assignedTo.name}</span></div>}
              <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-300">{new Date(ticket.createdAt).toLocaleDateString("es-ES")}</span></div>
            </div>
          </div>

          <PostSaleActions ticketId={ticket.id} status={ticket.status} />
        </div>
      </div>
    </div>
  );
}
