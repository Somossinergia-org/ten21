import { requireRole } from "@/lib/tenant";
import { FinancePanel } from "./finance-panel";

export default async function FinancePage() {
  await requireRole(["JEFE"]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-200">Control Financiero</h1>
      <p className="mt-1 text-sm text-slate-500">Facturas, IVA, gastos y alertas de vencimiento</p>
      <FinancePanel />
    </div>
  );
}
