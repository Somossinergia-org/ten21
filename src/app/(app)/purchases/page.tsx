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
        <Link
          href="/purchases/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo pedido
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
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
