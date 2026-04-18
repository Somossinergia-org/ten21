"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type QuickUser = {
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  color: string;
  icon: string;
};

export function QuickAccess({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const users: QuickUser[] = [
    {
      name: "Carlos Gutierrez",
      email: "jefe@todomueble.com",
      role: "JEFE",
      roleLabel: "Jefe / Admin",
      color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      icon: "👑",
    },
    {
      name: "Raquel Martinez",
      email: "almacen@todomueble.com",
      role: "ALMACEN",
      roleLabel: "Almacen",
      color: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      icon: "📦",
    },
    {
      name: "Demetrio Lopez",
      email: "reparto@todomueble.com",
      role: "REPARTO",
      roleLabel: "Reparto",
      color: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      icon: "🚛",
    },
  ];

  async function handleQuickLogin(email: string) {
    setLoading(email);
    const result = await signIn("credentials", {
      email,
      password: "password123",
      tenantId,
      redirect: false,
    });

    if (result?.error) {
      setLoading(null);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#050a14] px-3 text-cyan-500/50 uppercase tracking-wider font-medium">Acceso rapido</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {users.map((u) => (
          <button
            key={u.email}
            onClick={() => handleQuickLogin(u.email)}
            disabled={loading !== null}
            className={`w-full flex items-center gap-3 rounded-xl bg-gradient-to-r ${u.color} px-4 py-3 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]`}
          >
            <span className="text-2xl">{u.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">{u.name}</p>
              <p className="text-xs opacity-80">{u.roleLabel}</p>
            </div>
            {loading === u.email ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span className="text-sm opacity-60">→</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
