import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getTenantId } from "@/lib/tenant";
import * as purchaseService from "@/services/purchase.service";
import { SendOrderButton } from "./send-order-button";

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

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();
  const { id } = await params;

  const order = await purchaseService.getPurchaseOrder(id, tenantId);
  if (!order) {
    notFound();
  }

  const status = statusLabels[order.status] || { label: order.status, color: "bg-gray-100" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Creado por {order.createdBy.name} el{" "}
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.status === "DRAFT" && <SendOrderButton orderId={order.id} />}
          <Link
            href="/purchases"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Order info */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Proveedor</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{order.supplier.name}</p>
          <p className="text-xs text-gray-500">{order.supplier.code}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Tipo</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{typeLabels[order.type]}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Notas</p>
          <p className="mt-1 text-sm text-gray-900">{order.notes || "Sin notas"}</p>
        </div>
      </div>

      {/* Lines table */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Lineas del pedido</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Cantidad</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Recibido</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Coste unit.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{line.product.ref}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{line.product.name}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{line.quantityOrdered}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{line.quantityReceived}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">
                    {line.expectedUnitCost
                      ? `${Number(line.expectedUnitCost).toFixed(2)} €`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
