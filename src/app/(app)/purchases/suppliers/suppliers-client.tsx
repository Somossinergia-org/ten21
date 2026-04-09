"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplierAction } from "@/actions/purchase.actions";
import { QuickForm } from "@/components/purchases/quick-form";

type Supplier = {
  id: string;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
};

export function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Cancelar" : "Nuevo proveedor"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Nuevo proveedor</h3>
          <QuickForm
            action={createSupplierAction}
            buttonLabel="Crear proveedor"
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="name"
                placeholder="Nombre del proveedor"
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="code"
                placeholder="Codigo (ej: PROV-003)"
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="Telefono (opcional)"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                placeholder="Email (opcional)"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </QuickForm>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Codigo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Telefono</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay proveedores. Crea el primero.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{s.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
