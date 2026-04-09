"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPurchaseOrderAction } from "@/actions/purchase.actions";

export function SendOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!confirm("¿Enviar este pedido al proveedor?")) return;

    setLoading(true);
    const result = await sendPurchaseOrderAction(orderId);
    setLoading(false);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Enviar al proveedor"}
    </button>
  );
}
