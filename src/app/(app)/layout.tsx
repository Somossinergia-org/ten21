import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const tenant = await db.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { name: true },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={session.user.name}
          userRole={session.user.role}
          tenantName={tenant?.name ?? ""}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
