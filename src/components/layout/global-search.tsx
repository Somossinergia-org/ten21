"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

type SearchResult = {
  type: string;
  id: string;
  title: string;
  sub: string;
  href: string;
};

const typeIcons: Record<string, string> = {
  pedido: "📋",
  incidencia: "⚠️",
  entrega: "🚛",
  producto: "📦",
  proveedor: "🏭",
};

const typeColors: Record<string, string> = {
  pedido: "bg-blue-100 text-blue-700",
  incidencia: "bg-red-100 text-red-700",
  entrega: "bg-green-100 text-green-700",
  producto: "bg-purple-100 text-purple-700",
  proveedor: "bg-orange-100 text-orange-700",
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="hidden sm:flex items-center gap-2 rounded-lg border border-[#1a2d4a] bg-[#0a1628] px-3 py-1.5 text-xs text-slate-500 hover:border-cyan-500/30 transition-colors"
      >
        <Search size={14} />
        <span>Buscar...</span>
        <kbd className="hidden lg:inline rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">⌘K</kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="sm:hidden text-gray-400 hover:text-gray-600"
      >
        <Search size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/40" onClick={() => { setOpen(false); setQuery(""); }}>
          <div className="w-full max-w-lg mx-4 bg-[#0a1628] border border-[#1a2d4a] rounded-2xl shadow-2xl shadow-cyan-500/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2d4a]">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pedidos, incidencias, entregas, productos..."
                className="flex-1 text-sm outline-none bg-transparent text-slate-200 placeholder:text-slate-500"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Sin resultados para &quot;{query}&quot;</div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-1">
                  {results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => go(r.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-500/5 text-left transition-colors"
                    >
                      <span className="text-lg flex-shrink-0">{typeIcons[r.type] || "📄"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
                        {r.sub && <p className="text-xs text-slate-500 truncate">{r.sub}</p>}
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeColors[r.type] || "bg-gray-100"}`}>
                        {r.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {query.length < 2 && (
                <div className="px-4 py-6 text-center text-xs text-gray-300">
                  Escribe al menos 2 caracteres
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
