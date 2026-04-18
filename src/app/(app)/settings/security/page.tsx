import { requireAuth, getCurrentUser } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import { db } from "@/lib/db";
import { SecurityClient } from "./security-client";

export default async function SecurityPage() {
  await requireAuth();
  const me = await getCurrentUser();
  const mfa = await db.userMfa.findUnique({ where: { userId: me.id } });

  return (
    <div>
      <PageHeader title="Seguridad" />
      <SecurityClient mfaEnabled={mfa?.enabled ?? false} />
    </div>
  );
}
