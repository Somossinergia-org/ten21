"use client";

import Link from "next/link";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notification.actions";
import { Bell, AlertTriangle, Truck, Package, FileWarning, CheckCheck } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  entityType: string | null;
  entityId: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const typeIcons: Record<string, React.ReactNode> = {
  INCIDENT_CREATED: <AlertTriangle size={14} className="text-red-400" />,
  DELIVERY_FAILED: <Truck size={14} className="text-red-400" />,
  ORDER_PARTIAL: <Package size={14} className="text-amber-400" />,
  INVOICE_MISMATCH: <FileWarning size={14} className="text-red-400" />,
  SYSTEM: <Bell size={14} className="text-cyan-400" />,
};

const severityColors: Record<string, string> = {
  HIGH: "border-l-red-500",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-cyan-500",
};

function entityLink(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  const routes: Record<string, string> = {
    Incident: `/incidents/${entityId}`,
    Delivery: `/vehicles/deliveries/${entityId}`,
    PurchaseOrder: `/purchases/${entityId}`,
    SupplierInvoice: `/settings/finance`,
    Reception: `/reception/${entityId}`,
  };
  return routes[entityType] || null;
}

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mt-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo leido"}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsReadAction()}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a2d4a] px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          >
            <CheckCheck size={12} /> Marcar todo como leido
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-1.5">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/50 p-12 text-center">
            <Bell size={24} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">No hay notificaciones</p>
          </div>
        ) : (
          notifications.map((n) => {
            const link = entityLink(n.entityType, n.entityId);
            const isUnread = !n.readAt;

            const content = (
              <div
                className={`flex items-start gap-3 rounded-lg border-l-2 ${severityColors[n.severity] || "border-l-slate-500"} border border-[#1a2d4a] px-4 py-3 transition-colors ${
                  isUnread ? "bg-[#0a1628]/80" : "bg-[#050a14]/30 opacity-70"
                } hover:bg-white/[0.03]`}
              >
                <div className="mt-0.5 shrink-0">{typeIcons[n.type] || <Bell size={14} className="text-slate-500" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isUnread ? "text-slate-200" : "text-slate-400"}`}>{n.title}</p>
                    {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {new Date(n.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
                {isUnread && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); markNotificationReadAction(n.id); }}
                    className="shrink-0 text-[10px] text-slate-600 hover:text-cyan-400 transition-colors"
                  >
                    Leida
                  </button>
                )}
              </div>
            );

            if (link) {
              return <Link key={n.id} href={link}>{content}</Link>;
            }
            return <div key={n.id}>{content}</div>;
          })
        )}
      </div>
    </div>
  );
}
