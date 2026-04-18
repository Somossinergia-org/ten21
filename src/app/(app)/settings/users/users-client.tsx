"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { createUserAction, changePasswordAction, toggleUserActiveAction } from "@/actions/user.actions";
import type { Role } from "@prisma/client";

type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: Date;
};

const roleLabels: Record<string, { label: string; color: string }> = {
  JEFE: { label: "Jefe", color: "bg-blue-100 text-blue-700" },
  ALMACEN: { label: "Almacen", color: "bg-orange-100 text-orange-700" },
  REPARTO: { label: "Reparto", color: "bg-green-100 text-green-700" },
};

export function UsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwUserId, setPwUserId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  // New user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ALMACEN");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const result = await createUserAction({ name, email, password, role });
    setLoading(false);
    if (result.success) {
      toast("Usuario creado");
      setShowForm(false);
      setName(""); setEmail(""); setPassword("");
      router.refresh();
    } else {
      toast(result.error || "Error", "error");
    }
  }

  async function handleChangePw() {
    if (!pwUserId || !newPw) return;
    const result = await changePasswordAction({ userId: pwUserId, newPassword: newPw });
    if (result.success) {
      toast("Contraseña cambiada");
      setPwUserId(null);
      setNewPw("");
    } else {
      toast(result.error || "Error", "error");
    }
  }

  async function handleToggle(userId: string) {
    const result = await toggleUserActiveAction(userId);
    if (result.success) {
      toast("Estado cambiado");
      router.refresh();
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors">
          {showForm ? "Cancelar" : "Nuevo usuario"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Nuevo usuario</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña (min 6)" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="ALMACEN">Almacen</option>
              <option value="REPARTO">Reparto</option>
              <option value="JEFE">Jefe</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => {
              const rl = roleLabels[u.role] || { label: u.role, color: "bg-gray-100" };
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rl.color}`}>{rl.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.active ? "text-green-600" : "text-red-500"}`}>
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => { setPwUserId(u.id); setNewPw(""); }} className="text-xs text-cyan-400 hover:text-cyan-300">Contraseña</button>
                    <button onClick={() => handleToggle(u.id)} className="text-xs text-gray-500 hover:text-gray-700">
                      {u.active ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Change password modal */}
      {pwUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setPwUserId(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar contraseña</h3>
            <input value={newPw} onChange={(e) => setNewPw(e.target.value)} type="password" placeholder="Nueva contraseña (min 6)" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-4" />
            <div className="flex gap-2">
              <button onClick={handleChangePw} className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors">Cambiar</button>
              <button onClick={() => setPwUserId(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
