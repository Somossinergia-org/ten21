"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSalesOrderAction } from "@/actions/sales-order.actions";
import { Plus, Trash2 } from "lucide-react";

type Customer = { id: string; fullName: string };
type Product = { id: string; ref: string; name: string; salePrice: unknown; defaultCost: unknown };
type Line = { productId: string; description: string; quantity: number; unitSalePrice: number; unitExpectedCost: number };

export function NewSalesOrderForm({ customers, products }: { customers: Customer[]; products: Product[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [lines, setLines] = useState<Line[]>([{ productId: "", description: "", quantity: 1, unitSalePrice: 0, unitExpectedCost: 0 }]);

  function addLine() {
    setLines([...lines, { productId: "", description: "", quantity: 1, unitSalePrice: 0, unitExpectedCost: 0 }]);
  }

  function removeLine(i: number) {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof Line, value: string | number) {
    const next = [...lines];
    (next[i] as Record<string, unknown>)[field] = value;

    // Auto-fill from product
    if (field === "productId" && typeof value === "string" && value) {
      const p = products.find((pr) => pr.id === value);
      if (p) {
        next[i].description = `${p.ref} — ${p.name}`;
        next[i].unitSalePrice = p.salePrice ? Number(p.salePrice) : 0;
        next[i].unitExpectedCost = p.defaultCost ? Number(p.defaultCost) : 0;
      }
    }
    setLines(next);
  }

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitSalePrice, 0);
  const total = subtotal - discount;
  const margin = lines.reduce((s, l) => s + (l.unitSalePrice - l.unitExpectedCost) * l.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createSalesOrderAction({
      customerId,
      notes: notes || undefined,
      scheduledDeliveryDate: scheduledDate || undefined,
      discountTotal: discount,
      lines: lines.map((l) => ({
        productId: l.productId || undefined,
        description: l.description,
        quantity: l.quantity,
        unitSalePrice: l.unitSalePrice,
        unitExpectedCost: l.unitExpectedCost || undefined,
      })),
    });

    setLoading(false);
    if (result.success && result.orderId) {
      router.push(`/sales/${result.orderId}`);
    } else {
      setError(result.error || "Error");
    }
  }

  const inputCls = "w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Customer + date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Cliente *</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className={inputCls}>
            <option value="">Selecciona cliente</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Fecha entrega prevista</label>
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Lines */}
      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500/50">Lineas de venta</h3>
          <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
            <Plus size={12} /> Añadir linea
          </button>
        </div>

        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <select value={line.productId} onChange={(e) => updateLine(i, "productId", e.target.value)} className={`${inputCls} text-xs`}>
                  <option value="">Manual</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.ref} — {p.name}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input placeholder="Descripcion *" value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)} required className={`${inputCls} text-xs`} />
              </div>
              <div className="col-span-1">
                <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)} className={`${inputCls} text-xs text-center`} />
              </div>
              <div className="col-span-2">
                <input type="number" step="0.01" min="0" placeholder="PVP" value={line.unitSalePrice || ""} onChange={(e) => updateLine(i, "unitSalePrice", parseFloat(e.target.value) || 0)} className={`${inputCls} text-xs`} />
              </div>
              <div className="col-span-2">
                <input type="number" step="0.01" min="0" placeholder="Coste" value={line.unitExpectedCost || ""} onChange={(e) => updateLine(i, "unitExpectedCost", parseFloat(e.target.value) || 0)} className={`${inputCls} text-xs`} />
              </div>
              <div className="col-span-1 flex justify-center">
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-red-500/50 hover:text-red-400"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/50 p-3">
          <p className="text-[10px] text-slate-500 uppercase">Subtotal</p>
          <p className="font-mono text-slate-200">{subtotal.toFixed(2)} &euro;</p>
        </div>
        <div className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/50 p-3">
          <p className="text-[10px] text-slate-500 uppercase">Descuento</p>
          <input type="number" step="0.01" min="0" value={discount || ""} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-mono text-slate-200 focus:outline-none" />
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-[10px] text-cyan-500 uppercase">Total</p>
          <p className="font-mono font-bold text-cyan-400">{total.toFixed(2)} &euro;</p>
        </div>
        <div className="rounded-lg border border-[#1a2d4a] bg-[#0a1628]/50 p-3">
          <p className="text-[10px] text-slate-500 uppercase">Margen est.</p>
          <p className={`font-mono ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>{margin.toFixed(2)} &euro;</p>
        </div>
      </div>

      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className={inputCls} />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors">
        {loading ? "Creando..." : "Crear venta (borrador)"}
      </button>
    </form>
  );
}
