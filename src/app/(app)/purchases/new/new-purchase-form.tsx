"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseOrderAction } from "@/actions/purchase.actions";

type Supplier = { id: string; name: string; code: string };
type Product = { id: string; ref: string; name: string };

type OrderLine = {
  productId: string;
  quantityOrdered: number;
  expectedUnitCost: number | undefined;
};

export function NewPurchaseForm({
  suppliers,
  products,
}: {
  suppliers: Supplier[];
  products: Product[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [type, setType] = useState<"SALE" | "EXHIBITION">("SALE");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([
    { productId: "", quantityOrdered: 1, expectedUnitCost: undefined },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addLine() {
    setLines([...lines, { productId: "", quantityOrdered: 1, expectedUnitCost: undefined }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof OrderLine, value: string | number) {
    setLines(
      lines.map((line, i) => {
        if (i !== index) return line;
        return { ...line, [field]: value };
      }),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createPurchaseOrderAction({
      supplierId,
      type,
      notes: notes || undefined,
      lines: lines.map((l) => ({
        productId: l.productId,
        quantityOrdered: l.quantityOrdered,
        expectedUnitCost: l.expectedUnitCost,
      })),
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al crear el pedido");
      return;
    }

    router.push(`/purchases/${result.orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Header fields */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecciona proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "SALE" | "EXHIBITION")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="SALE">Venta</option>
              <option value="EXHIBITION">Exposicion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas opcionales"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Order lines */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Lineas del pedido</h3>
          <button
            type="button"
            onClick={addLine}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            + Añadir linea
          </button>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium uppercase text-gray-500 px-1">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2">Cantidad</div>
            <div className="col-span-3">Coste unit. esperado</div>
            <div className="col-span-2"></div>
          </div>

          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(index, "productId", e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecciona producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ref} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={line.quantityOrdered}
                  onChange={(e) => updateLine(index, "quantityOrdered", parseInt(e.target.value) || 1)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.expectedUnitCost ?? ""}
                  onChange={(e) =>
                    updateLine(index, "expectedUnitCost", e.target.value ? parseFloat(e.target.value) : "")
                  }
                  placeholder="0.00"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2 text-right">
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear pedido"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/purchases")}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
