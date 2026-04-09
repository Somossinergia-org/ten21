import { requireRole } from "@/lib/tenant";

export default async function DashboardPage() {
  const session = await requireRole(["JEFE"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bienvenido, {session.user.name}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pedidos pendientes", value: "—" },
          { label: "Recepciones pendientes", value: "—" },
          { label: "Incidencias abiertas", value: "—" },
          { label: "Entregas hoy", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Las metricas se conectaran en la Fase 6</p>
        <p className="mt-1 text-xs text-gray-400">Modulo en construccion</p>
      </div>
    </div>
  );
}
