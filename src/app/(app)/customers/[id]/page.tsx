import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as customerService from "@/services/customer.service";
import { MapPin, Phone, Mail, Package, ArrowLeft } from "lucide-react";
import { CustomerEditForm } from "./customer-edit";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const { id } = await params;
  const customer = await customerService.getCustomer(id, tenantId);

  if (!customer) notFound();

  const statusColors: Record<string, string> = {
    PENDING: "bg-slate-500/10 text-slate-400",
    ASSIGNED: "bg-blue-500/10 text-blue-400",
    IN_TRANSIT: "bg-amber-500/10 text-amber-400",
    DELIVERED: "bg-emerald-500/10 text-emerald-400",
    FAILED: "bg-red-500/10 text-red-400",
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/customers" className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={12} /> Volver a clientes
        </Link>
      </div>

      <PageHeader title={customer.fullName} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Datos del cliente</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin size={14} className="mt-0.5 text-slate-500 shrink-0" />
                <div>
                  <p>{customer.addressLine1}</p>
                  {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                  {(customer.postalCode || customer.city) && (
                    <p className="text-slate-500">{[customer.postalCode, customer.city, customer.province].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={14} className="text-slate-500" />
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-slate-500" />
                  {customer.email}
                </div>
              )}
            </div>
            {customer.notes && (
              <div className="mt-3 pt-3 border-t border-[#1a2d4a]">
                <p className="text-xs text-slate-500 mb-1">Notas</p>
                <p className="text-sm text-slate-400">{customer.notes}</p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-[#1a2d4a]">
              <p className="text-xs text-slate-500">
                Estado: <span className={customer.active ? "text-emerald-400" : "text-red-400"}>{customer.active ? "Activo" : "Inactivo"}</span>
              </p>
            </div>
          </div>

          {/* Edit form */}
          <CustomerEditForm customer={customer} />
        </div>

        {/* Delivery history */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">
              Historial de entregas ({customer.deliveries.length})
            </h3>

            {customer.deliveries.length === 0 ? (
              <p className="text-sm text-slate-600 py-4 text-center">Sin entregas registradas</p>
            ) : (
              <div className="space-y-2">
                {customer.deliveries.map((d) => (
                  <Link
                    key={d.id}
                    href={`/vehicles/deliveries/${d.id}`}
                    className="flex items-center gap-3 rounded-lg border border-[#1a2d4a] px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <Package size={14} className="text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">{d.deliveryNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[d.status] || "bg-slate-500/10 text-slate-400"}`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{d.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {d.vehicle && <p className="text-xs text-slate-500">{d.vehicle.name}</p>}
                      {d.assignedTo && <p className="text-xs text-slate-600">{d.assignedTo.name}</p>}
                      {d.scheduledDate && (
                        <p className="text-[10px] text-slate-600">
                          {new Date(d.scheduledDate).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
