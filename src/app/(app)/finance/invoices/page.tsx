import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as invoiceService from "@/services/customer-invoice.service";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-400",
  ISSUED: "bg-blue-500/10 text-blue-400",
  PARTIALLY_PAID: "bg-amber-500/10 text-amber-400",
  PAID: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador", ISSUED: "Emitida", PARTIALLY_PAID: "Cobro parcial", PAID: "Cobrada", CANCELLED: "Anulada",
};

export default async function CustomerInvoicesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const invoices = await invoiceService.listInvoices(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Facturas a cliente" />
        <Link href="/finance/invoices/new" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">Nueva factura</Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">N. Factura</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3 text-center">Lineas</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">Sin facturas</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3"><Link href={`/finance/invoices/${inv.id}`} className="font-mono text-cyan-400 hover:text-cyan-300">{inv.invoiceNumber}</Link></td>
                <td className="px-4 py-3 text-slate-300">{inv.customer.fullName}</td>
                <td className="px-4 py-3 text-center text-slate-400">{inv._count.lines}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-200">{Number(inv.total).toFixed(2)} &euro;</td>
                <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[inv.status]}`}>{statusLabels[inv.status]}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
