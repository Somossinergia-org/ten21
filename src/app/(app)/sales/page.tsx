import { requireRole } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";

export default async function SalesPage() {
  await requireRole(["JEFE"]);
  return (
    <div>
      <PageHeader title="Ventas" />
      <div className="mt-6 rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-12 text-center">
        <p className="text-sm text-slate-400">Modulo de ventas en construccion</p>
      </div>
    </div>
  );
}
