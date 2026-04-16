import { requireAuth, getTenantId, getCurrentUser } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as notifService from "@/services/notification.service";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  await requireAuth();
  const tenantId = await getTenantId();
  const me = await getCurrentUser();

  const notifications = await notifService.listForUser(tenantId, me.id);

  return (
    <div>
      <PageHeader title="Notificaciones" />
      <NotificationsClient notifications={notifications} />
    </div>
  );
}
