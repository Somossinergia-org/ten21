"use client";

import { useState } from "react";
import { initMfaAction, enableMfaAction, disableMfaAction } from "@/actions/security.actions";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";

export function SecurityClient({ mfaEnabled }: { mfaEnabled: boolean }) {
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true); setError("");
    const result = await initMfaAction();
    setLoading(false);
    if (result.success) setSetup(result.data as { secret: string; otpauthUrl: string });
    else setError(result.error || "Error");
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const result = await enableMfaAction({ code: fd.get("code") as string });
    setLoading(false);
    if (result.success) {
      const data = result.data as { recoveryCodes: string[] };
      setRecoveryCodes(data.recoveryCodes);
      setSetup(null);
    } else setError(result.error || "Error");
  }

  async function handleDisable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const result = await disableMfaAction({
      password: fd.get("password") as string,
      code: fd.get("code") as string,
    });
    setLoading(false);
    if (!result.success) setError(result.error || "Error");
  }

  return (
    <div className="mt-4 max-w-lg space-y-4">
      {/* MFA status */}
      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-5">
        <div className="flex items-center gap-3 mb-3">
          {mfaEnabled ? <ShieldCheck size={20} className="text-emerald-400" /> : <ShieldOff size={20} className="text-slate-500" />}
          <div>
            <h3 className="text-sm font-medium text-slate-200">Autenticacion en 2 pasos (2FA)</h3>
            <p className="text-xs text-slate-500">{mfaEnabled ? "Activada con app authenticator" : "No activada"}</p>
          </div>
        </div>

        {!mfaEnabled && !setup && !recoveryCodes && (
          <button onClick={handleStart} disabled={loading} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700 disabled:opacity-50">
            {loading ? "Cargando..." : "Activar 2FA"}
          </button>
        )}

        {setup && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-slate-400">1. Escanea este codigo con Google Authenticator o similar:</p>
            <div className="rounded-lg bg-white p-3 text-center">
              <p className="font-mono text-xs text-black break-all">{setup.otpauthUrl}</p>
            </div>
            <p className="text-xs text-slate-400">O introduce manualmente: <code className="font-mono text-cyan-400">{setup.secret}</code></p>

            <form onSubmit={handleVerify} className="space-y-2">
              <input name="code" placeholder="Codigo de 6 digitos" maxLength={6} required
                className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-center font-mono text-lg text-slate-200 focus:border-cyan-500/50 focus:outline-none" />
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700 disabled:opacity-50">
                {loading ? "Verificando..." : "Verificar y activar"}
              </button>
            </form>
          </div>
        )}

        {recoveryCodes && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-xs font-bold text-amber-400 mb-2">Guarda estos codigos de recuperacion:</p>
            <div className="grid grid-cols-2 gap-1 font-mono text-xs text-slate-300">
              {recoveryCodes.map((c, i) => <div key={i}>{c}</div>)}
            </div>
            <p className="text-[10px] text-amber-500 mt-2">Cada codigo solo se puede usar una vez. No podras verlos de nuevo.</p>
          </div>
        )}

        {mfaEnabled && (
          <form onSubmit={handleDisable} className="mt-3 space-y-2">
            <p className="text-xs text-slate-400">Para desactivar 2FA necesitas tu contrasena y codigo actual.</p>
            <input name="password" type="password" placeholder="Contrasena" required
              className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 text-sm text-slate-200" />
            <input name="code" placeholder="Codigo 2FA" maxLength={6} required
              className="w-full rounded-lg border border-[#1a2d4a] bg-[#050a14] px-3 py-2 font-mono text-sm text-slate-200" />
            <button type="submit" disabled={loading} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50">
              Desactivar 2FA
            </button>
          </form>
        )}

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      <div className="rounded-xl border border-[#1a2d4a] bg-[#0a1628]/80 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-cyan-400" />
          <h3 className="text-sm font-medium text-slate-200">Recomendaciones</h3>
        </div>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>• Activa 2FA para maxima seguridad</li>
          <li>• No compartas tus codigos de recuperacion</li>
          <li>• Tu sesion expira tras 8 horas de inactividad</li>
          <li>• Cambia tu contrasena si sospechas acceso no autorizado</li>
        </ul>
      </div>
    </div>
  );
}
