import { requireAuth } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";

export default async function NotificationsPage() {
  await requireAuth();

  return (
    <div>
      <PageHeader title="Notificaciones" />
      <div className="mt-6 rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-12 text-center">
        <p className="text-sm text-slate-400">Centro de notificaciones en construccion</p>
        <p className="mt-1 text-xs text-slate-600">Alertas de incidencias, entregas fallidas, pedidos parciales</p>
      </div>
    </div>
  );
}
