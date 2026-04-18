const presets: Record<string, string> = {
  // Sales
  DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTIALLY_RESERVED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RESERVED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  IN_DELIVERY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  // Delivery
  PENDING: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  ASSIGNED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_TRANSIT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  // Incidents / PostSale
  REGISTERED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NOTIFIED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  REVIEWED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CLOSED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  WAITING_SUPPLIER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  // Purchase
  SENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTIAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RECEIVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  // Invoice
  ISSUED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTIALLY_PAID: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  // Billing
  TRIAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PAST_DUE: "bg-red-500/10 text-red-400 border-red-500/20",
  PAUSED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  EXPIRED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const labels: Record<string, string> = {
  DRAFT: "Borrador", CONFIRMED: "Confirmada", PARTIALLY_RESERVED: "Reserva parcial",
  RESERVED: "Reservada", IN_DELIVERY: "En entrega", DELIVERED: "Entregada", CANCELLED: "Cancelada",
  PENDING: "Pendiente", ASSIGNED: "Asignada", IN_TRANSIT: "En ruta", FAILED: "Fallida",
  REGISTERED: "Registrada", NOTIFIED: "Notificada", REVIEWED: "Revisada", CLOSED: "Cerrada",
  OPEN: "Abierto", IN_PROGRESS: "En progreso", WAITING_SUPPLIER: "Esperando prov.", RESOLVED: "Resuelto",
  SENT: "Enviado", PARTIAL: "Parcial", RECEIVED: "Recibido",
  ISSUED: "Emitida", PARTIALLY_PAID: "Cobro parcial", PAID: "Cobrada",
  TRIAL: "Trial", ACTIVE: "Activa", PAST_DUE: "Impago", PAUSED: "Pausada", EXPIRED: "Expirada",
  COMPLETED: "Completada", WITH_INCIDENTS: "Con incidencias",
};

export function StatusChip({ status, size = "sm" }: { status: string; size?: "xs" | "sm" }) {
  const cls = presets[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  const label = labels[status] || status;
  const sizeClasses = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${cls} ${sizeClasses}`}>
      {label}
    </span>
  );
}
