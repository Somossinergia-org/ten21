const actionLabels: Record<string, { label: string; color: string }> = {
  "purchase.created": { label: "Pedido creado", color: "bg-blue-500" },
  "purchase.sent": { label: "Pedido enviado al proveedor", color: "bg-blue-600" },
  "reception.created": { label: "Recepcion registrada", color: "bg-orange-500" },
  "reception.completed": { label: "Recepcion completada", color: "bg-green-500" },
  "incident.created": { label: "Incidencia detectada", color: "bg-red-500" },
  "incident.notified": { label: "Incidencia notificada", color: "bg-blue-500" },
  "incident.reviewed": { label: "Incidencia revisada", color: "bg-purple-500" },
  "incident.closed": { label: "Incidencia cerrada", color: "bg-green-500" },
  "delivery.created": { label: "Entrega creada", color: "bg-blue-500" },
  "delivery.started": { label: "Ruta iniciada", color: "bg-yellow-500" },
  "delivery.completed": { label: "Entrega completada", color: "bg-green-500" },
  "delivery.failed": { label: "Entrega fallida", color: "bg-red-500" },
  "product.created": { label: "Producto creado", color: "bg-gray-400" },
  "supplier.created": { label: "Proveedor creado", color: "bg-gray-400" },
  "vehicle.synced": { label: "Vehiculo sincronizado", color: "bg-cyan-500" },
};

type LogEntry = {
  id: string;
  action: string;
  userName: string | null;
  details: unknown;
  createdAt: Date;
};

export function ActivityTimeline({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Historial de actividad</h2>
      <div className="relative pl-6 space-y-3">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-200" />

        {logs.map((log) => {
          const config = actionLabels[log.action] || { label: log.action, color: "bg-gray-400" };
          const details = log.details as Record<string, unknown> | null;

          return (
            <div key={log.id} className="relative flex items-start gap-3">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 h-3 w-3 rounded-full ${config.color} ring-2 ring-white`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{config.label}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{log.userName || "Sistema"}</span>
                  <span>·</span>
                  <span>
                    {new Date(log.createdAt).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {details && Object.keys(details).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Object.entries(details)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
