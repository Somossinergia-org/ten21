"use client";

import { useState } from "react";
import { manualAdjustmentAction } from "@/actions/inventory.actions";
import { Package, Plus, Minus } from "lucide-react";

type InventoryItem = {
  id: string;
  productId: string;
  onHand: number;
  reserved: number;
  available: number;
  product: { ref: string; name: string; category: string | null; brand: string | null; active: boolean };
};

export function InventoryClient({ inventory }: { inventory: InventoryItem[] }) {
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [qty, setQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdjust() {
    if (!adjusting || qty === 0 || !notes.trim()) {
      setError("Cantidad y motivo obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    const result = await manualAdjustmentAction({ productId: adjusting, quantity: qty, notes });
    setLoading(false);
    if (result.success) {
      setAdjusting(null);
      setQty(0);
      setNotes("");
    } else {
      setError(result.error || "Error");
    }
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-xl border border-[#1a2d4a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2d4a] bg-[#0a1628]/80 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 hidden md:table-cell">Categoria</th>
              <th className="px-4 py-3 text-center">En almacen</th>
              <th className="px-4 py-3 text-center">Reservado</th>
              <th className="px-4 py-3 text-center">Disponible</th>
              <th className="px-4 py-3 text-center">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2d4a]">
            {inventory.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-600">Sin datos de inventario. Se crearan al recepcionar mercancia.</td></tr>
            ) : inventory.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-cyan-500">{item.product.ref}</td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Package size={13} className="text-slate-600" />
                    {item.product.name}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{item.product.category || "—"}</td>
                <td className="px-4 py-3 text-center font-mono text-slate-300">{item.onHand}</td>
                <td className="px-4 py-3 text-center font-mono text-amber-400">{item.reserved}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono font-medium ${item.available > 0 ? "text-emerald-400" : item.available === 0 ? "text-slate-500" : "text-red-400"}`}>
                    {item.available}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setAdjusting(item.productId); setQty(0); setNotes(""); setError(""); }}
                    className="text-slate-600 hover:text-cyan-400 transition-colors text-xs">
                    Ajustar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjustment modal */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAdjusting(null)}>
          <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628] p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-200 mb-4">Ajuste manual de stock</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty(qty - 1)} className="rounded-lg border border-[#1a2d4a] p-2 text-red-400 hover:bg-red-500/10"><Minus size={14} /></button>
                <input type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  className="flex-1 rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-center font-mono text-lg text-slate-200 focus:border-cyan-500/50 focus:outline-none" />
                <button type="button" onClick={() => setQty(qty + 1)} className="rounded-lg border border-[#1a2d4a] p-2 text-emerald-400 hover:bg-emerald-500/10"><Plus size={14} /></button>
              </div>
              <textarea placeholder="Motivo del ajuste (obligatorio)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none" />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleAdjust} disabled={loading}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
                  {loading ? "Ajustando..." : "Aplicar ajuste"}
                </button>
                <button onClick={() => setAdjusting(null)} className="rounded-lg border border-[#1a2d4a] px-4 py-2 text-sm text-slate-400">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-slate-600">{inventory.length} productos con stock</p>
    </div>
  );
}
