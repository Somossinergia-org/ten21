import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginForm } from "./login-form";
import { QuickAccess } from "./quick-access";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  const tenants = await db.tenant.findMany({
    where: { active: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-glow">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Ten21
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gestion de tienda
          </p>
        </div>

        {/* Quick access buttons */}
        {tenants.length === 1 && (
          <QuickAccess tenantId={tenants[0].id} />
        )}

        {/* Divider */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#050a14] px-3 text-slate-600 uppercase tracking-wider font-medium">
              O entra con tus datos
            </span>
          </div>
        </div>

        <div className="mt-6">
          <LoginForm tenants={tenants} />
        </div>
      </div>
    </div>
  );
}
