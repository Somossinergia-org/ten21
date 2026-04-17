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

  const [tenant, openIncidents, unreadNotifications] = await Promise.all([
    db.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { name: true },
    }),
    db.incident.count({
      where: {
        tenantId: session.user.tenantId,
        status: { in: ["REGISTERED", "NOTIFIED"] },
      },
    }),
    db.notification.count({
      where: {
        tenantId: session.user.tenantId,
        readAt: null,
        OR: [{ userId: session.user.id }, { userId: null }],
      },
    }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.user.role} isSuperAdmin={session.user.isSuperAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={session.user.name}
          userRole={session.user.role}
          tenantName={tenant?.name ?? ""}
          openIncidents={openIncidents}
          unreadNotifications={unreadNotifications}
        />
        <main className="flex-1 overflow-y-auto bg-[#050a14] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
