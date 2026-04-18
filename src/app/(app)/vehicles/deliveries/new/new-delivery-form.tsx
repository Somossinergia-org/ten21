"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDeliveryAction } from "@/actions/delivery.actions";

type Vehicle = { id: string; name: string; plate: string; status: string };
type User = { id: string; name: string };

export function NewDeliveryForm({
  vehicles,
  users,
}: {
  vehicles: Vehicle[];
  users: User[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const result = await createDeliveryAction({
      customerName,
      customerPhone: customerPhone || undefined,
      customerAddress,
      description,
      scheduledDate: scheduledDate || undefined,
      vehicleId,
      assignedToId,
      notes: notes || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al crear la entrega");
      return;
    }

    router.push(`/vehicles/deliveries/${result.deliveryId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Client info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Datos del cliente</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Direccion *</label>
            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Entrega</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Que se entrega *</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Sofa 3 plazas + mesa auxiliar" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehiculo *</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Selecciona vehiculo</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repartidor *</label>
            <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Selecciona repartidor</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha programada</label>
            <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Creando..." : "Crear entrega"}
        </button>
        <button type="button" onClick={() => router.push("/vehicles/deliveries")} className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
