import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";
import { Package, AlertTriangle } from "lucide-react";

export default async function MobileAlmacenPage() {
  await requireRole(["ALMACEN", "JEFE"]);
  const tenantId = await getTenantId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingReceptions, openIncidents] = await Promise.all([
    db.reception.findMany({
      where: { tenantId, status: { in: ["PENDING", "CHECKING"] } },
      include: { purchaseOrder: { select: { orderNumber: true, supplier: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.incident.count({ where: { tenantId, status: { in: ["REGISTERED", "NOTIFIED"] } } }),
  ]);

  return (
    <div>
      <PageHeader title="Almacen" />

      <div className="mt-4 grid grid-cols-2 gap-3 mb-6">
        <Link href="/reception" className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 hover:bg-white/[0.03] active:scale-[0.99] transition-all text-center">
          <Package size={24} className="mx-auto text-cyan-400 mb-1" />
          <p className="text-xs text-slate-500">Recepciones</p>
          <p className="text-lg font-bold text-slate-200">{pendingReceptions.length}</p>
        </Link>
        <Link href="/incidents" className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 hover:bg-white/[0.03] active:scale-[0.99] transition-all text-center">
          <AlertTriangle size={24} className="mx-auto text-red-400 mb-1" />
          <p className="text-xs text-slate-500">Incidencias</p>
          <p className="text-lg font-bold text-slate-200">{openIncidents}</p>
        </Link>
      </div>

      {pendingReceptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50">Pendientes de chequeo</h3>
          {pendingReceptions.map((r) => (
            <Link key={r.id} href={`/reception/${r.id}`}
              className="block rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-3 hover:bg-white/[0.02] active:scale-[0.99] transition-all">
              <div className="flex justify-between">
                <span className="font-mono text-sm text-cyan-400">{r.receptionNumber}</span>
                <span className="text-[10px] text-slate-500">{r.status}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{r.purchaseOrder.orderNumber} — {r.purchaseOrder.supplier.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
