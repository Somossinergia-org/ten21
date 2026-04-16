"use client";

import { toggleModuleAction } from "@/actions/tenant-config.actions";
import { Package, CheckCircle, XCircle } from "lucide-react";

type Module = { id: string; moduleCode: string; enabled: boolean };
type ModuleDef = { code: string; label: string; critical: boolean };

export function ModulesClient({ modules, allModules }: { modules: Module[]; allModules: ModuleDef[] }) {
  const enabledMap = new Map(modules.map((m) => [m.moduleCode, m.enabled]));

  return (
    <div className="mt-4 space-y-2 max-w-lg">
      {allModules.map((mod) => {
        const isEnabled = enabledMap.get(mod.code) ?? true;
        return (
          <div key={mod.code} className="flex items-center justify-between rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <Package size={14} className={isEnabled ? "text-cyan-400" : "text-slate-600"} />
              <div>
                <p className="text-sm text-slate-200">{mod.label}</p>
                <p className="text-[10px] text-slate-600 font-mono">{mod.code}{mod.critical ? " (critico)" : ""}</p>
              </div>
            </div>
            <button
              onClick={() => toggleModuleAction({ moduleCode: mod.code, enabled: !isEnabled })}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"
              }`}
            >
              {isEnabled ? <><CheckCircle size={12} /> Activo</> : <><XCircle size={12} /> Inactivo</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
