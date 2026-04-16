import { requireRole, getTenantId } from "@/lib/tenant";
import * as statsService from "@/services/stats.service";

export default async function StatsPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const suppliers = await statsService.getSupplierStats(tenantId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Estadisticas</h1>
      <p className="mt-1 text-sm text-gray-500">Fiabilidad de proveedores basada en recepciones</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400 font-mono">{s.code}</p>
              </div>
              <div className={`rounded-full px-3 py-1 text-lg font-black ${
                s.reliability >= 90 ? "bg-green-100 text-green-700" :
                s.reliability >= 70 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {s.reliability}%
              </div>
            </div>

            {/* Reliability bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${
                  s.reliability >= 90 ? "bg-green-500" :
                  s.reliability >= 70 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${s.reliability}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-gray-900">{s.totalOrders}</p>
                <p className="text-[10px] text-gray-400 uppercase">Pedidos</p>
              </div>
              <div>
                <p className="text-lg font-black text-gray-900">{s.totalReceptions}</p>
                <p className="text-[10px] text-gray-400 uppercase">Recepciones</p>
              </div>
              <div>
                <p className="text-lg font-black text-red-600">{s.totalIncidents}</p>
                <p className="text-[10px] text-gray-400 uppercase">Incidencias</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
