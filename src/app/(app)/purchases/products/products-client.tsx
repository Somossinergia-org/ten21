"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/purchase.actions";
import { QuickForm } from "@/components/purchases/quick-form";

type Product = {
  id: string;
  ref: string;
  name: string;
  description: string | null;
};

export function ProductsClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6 space-y-6">
      {/* Action bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          {showForm ? "Cancelar" : "Nuevo producto"}
        </button>
      </div>

      {/* Quick create form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Nuevo producto</h3>
          <QuickForm
            action={createProductAction}
            buttonLabel="Crear producto"
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                name="ref"
                placeholder="Referencia (ej: SOF-002)"
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="name"
                placeholder="Nombre del producto"
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="description"
                placeholder="Descripcion (opcional)"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </QuickForm>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Ref</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripcion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay productos. Crea el primero.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{p.ref}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.description || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
