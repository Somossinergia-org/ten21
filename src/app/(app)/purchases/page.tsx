import Link from "next/link";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as purchaseService from "@/services/purchase.service";

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  SENT: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  PARTIAL: { label: "Parcial", color: "bg-yellow-100 text-yellow-700" },
  RECEIVED: { label: "Recibido", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Cerrado", color: "bg-gray-100 text-gray-500" },
};

const typeLabels: Record<string, string> = {
  SALE: "Venta",
  EXHIBITION: "Exposicion",
};

export default async function PurchasesPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const orders = await purchaseService.listPurchaseOrders(tenantId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pedidos a proveedores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/purchases"
            className="rounded-lg border border-[#1a2d4a] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
          >
            Exportar Excel
          </a>
          <Link
            href="/purchases/new"
            className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            Nuevo pedido
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pedido</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Lineas</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay pedidos. Crea el primero.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = statusLabels[order.status] || { label: order.status, color: "bg-gray-100" };
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{typeLabels[order.type] || order.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order._count.lines}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/purchases/${order.id}`}
                        className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
