"use client";

import { useState } from "react";
import { confirmSalesOrderAction, cancelSalesOrderAction } from "@/actions/sales-order.actions";
import { CheckCircle, XCircle } from "lucide-react";

export function SalesOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading("confirm");
    setError("");
    const result = await confirmSalesOrderAction(orderId);
    setLoading("");
    if (!result.success) setError(result.error || "Error");
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar esta venta? Se liberara cualquier reserva de stock.")) return;
    setLoading("cancel");
    setError("");
    const result = await cancelSalesOrderAction(orderId);
    setLoading("");
    if (!result.success) setError(result.error || "Error");
  }

  const canConfirm = status === "DRAFT";
  const canCancel = ["DRAFT", "CONFIRMED", "PARTIALLY_RESERVED", "RESERVED"].includes(status);

  if (!canConfirm && !canCancel) return null;

  return (
    <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50 mb-3">Acciones</h3>

      {canConfirm && (
        <button onClick={handleConfirm} disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors">
          {loading === "confirm" ? "Confirmando..." : <><CheckCircle size={14} /> Confirmar venta</>}
        </button>
      )}

      {canCancel && (
        <button onClick={handleCancel} disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors">
          {loading === "cancel" ? "Cancelando..." : <><XCircle size={14} /> Cancelar venta</>}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
