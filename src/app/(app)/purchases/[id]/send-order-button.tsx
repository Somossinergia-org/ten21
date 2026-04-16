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
      className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Enviar al proveedor"}
    </button>
  );
}
