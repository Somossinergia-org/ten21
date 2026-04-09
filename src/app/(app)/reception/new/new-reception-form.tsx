"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReceptionAction } from "@/actions/reception.actions";

type OrderLine = {
  id: string;
  quantityOrdered: number;
  quantityReceived: number;
  product: { ref: string; name: string };
};

type Order = {
  id: string;
  orderNumber: string;
  supplier: { name: string };
  lines: OrderLine[];
};

type ReceptionLine = {
  purchaseOrderLineId: string;
  productRef: string;
  productName: string;
  quantityExpected: number;
  quantityReceived: number;
  quantityDamaged: number;
  notes: string;
};

export function NewReceptionForm({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [deliveryNoteRef, setDeliveryNoteRef] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<ReceptionLine[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  function handleOrderChange(orderId: string) {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      setLines([]);
      return;
    }

    // Auto-generate lines from the purchase order
    // quantityExpected = remaining to receive (ordered - already received)
    setLines(
      order.lines.map((ol) => ({
        purchaseOrderLineId: ol.id,
        productRef: ol.product.ref,
        productName: ol.product.name,
        quantityExpected: ol.quantityOrdered - ol.quantityReceived,
        quantityReceived: ol.quantityOrdered - ol.quantityReceived, // Default: expect full delivery
        quantityDamaged: 0,
        notes: "",
      })),
    );
  }

  function updateLine(index: number, field: keyof ReceptionLine, value: string | number) {
    setLines(lines.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createReceptionAction({
      purchaseOrderId: selectedOrderId,
      deliveryNoteRef: deliveryNoteRef || undefined,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        purchaseOrderLineId: l.purchaseOrderLineId,
        quantityExpected: l.quantityExpected,
        quantityReceived: l.quantityReceived,
        quantityDamaged: l.quantityDamaged,
        notes: l.notes || undefined,
      })),
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al crear la recepcion");
      return;
    }

    router.push(`/reception/${result.receptionId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Order selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pedido *</label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecciona pedido</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ref. albaran proveedor
            </label>
            <input
              value={deliveryNoteRef}
              onChange={(e) => setDeliveryNoteRef(e.target.value)}
              placeholder="Numero del albaran"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Reception lines */}
      {selectedOrder && lines.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Lineas de recepcion — {selectedOrder.orderNumber}
          </h3>
          <p className="mb-4 text-xs text-gray-500">
            Introduce las cantidades realmente recibidas y dañadas para cada producto.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-3 text-left">Producto</th>
                  <th className="pb-2 px-3 text-right w-24">Esperado</th>
                  <th className="pb-2 px-3 text-right w-28">Recibido *</th>
                  <th className="pb-2 px-3 text-right w-28">Dañado</th>
                  <th className="pb-2 pl-3 text-left">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line, idx) => {
                  const mismatch = line.quantityReceived !== line.quantityExpected;
                  const damaged = line.quantityDamaged > 0;
                  const rowColor = mismatch || damaged ? "bg-red-50" : "";

                  return (
                    <tr key={line.purchaseOrderLineId} className={rowColor}>
                      <td className="py-2 pr-3">
                        <span className="text-sm font-mono text-gray-700">{line.productRef}</span>
                        <span className="ml-2 text-sm text-gray-500">{line.productName}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-gray-500">
                        {line.quantityExpected}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={line.quantityReceived}
                          onChange={(e) =>
                            updateLine(idx, "quantityReceived", parseInt(e.target.value) || 0)
                          }
                          className={`w-full rounded-md border px-2 py-1.5 text-sm text-right ${
                            mismatch ? "border-red-300 bg-red-50" : "border-gray-300"
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={line.quantityDamaged}
                          onChange={(e) =>
                            updateLine(idx, "quantityDamaged", parseInt(e.target.value) || 0)
                          }
                          className={`w-full rounded-md border px-2 py-1.5 text-sm text-right ${
                            damaged ? "border-orange-300 bg-orange-50" : "border-gray-300"
                          }`}
                        />
                      </td>
                      <td className="py-2 pl-3">
                        <input
                          value={line.notes}
                          onChange={(e) => updateLine(idx, "notes", e.target.value)}
                          placeholder="—"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Preview of detected issues */}
          {lines.some(
            (l) => l.quantityReceived !== l.quantityExpected || l.quantityDamaged > 0,
          ) && (
            <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-1">
                Se detectaran incidencias al guardar:
              </p>
              <ul className="text-xs text-yellow-700 space-y-0.5">
                {lines
                  .filter((l) => l.quantityReceived !== l.quantityExpected)
                  .map((l) => (
                    <li key={`q-${l.purchaseOrderLineId}`}>
                      {l.productRef}: esperado {l.quantityExpected}, recibido{" "}
                      {l.quantityReceived} (diferencia)
                    </li>
                  ))}
                {lines
                  .filter((l) => l.quantityDamaged > 0)
                  .map((l) => (
                    <li key={`d-${l.purchaseOrderLineId}`}>
                      {l.productRef}: {l.quantityDamaged} unidad(es) dañada(s)
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !selectedOrderId}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar recepcion"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/reception")}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
