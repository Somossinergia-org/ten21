import { requireRole } from "@/lib/tenant";
import { AIPanel } from "./ai-panel";

export default async function AIPage() {
  await requireRole(["JEFE"]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-200">Centro de Inteligencia</h1>
      <p className="mt-1 text-sm text-slate-500">IA aplicada a tu negocio — informes, alertas y analisis</p>
      <AIPanel />
    </div>
  );
}
