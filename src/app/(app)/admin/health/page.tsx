import { requireSuperAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as healthService from "@/services/health.service";
import { HealthClient } from "./health-client";

export default async function HealthPage() {
  await requireSuperAdmin();
  const [events, summary] = await Promise.all([
    healthService.listEvents({ limit: 50 }),
    healthService.getSummary(),
  ]);

  return (
    <div>
      <PageHeader title="Salud del sistema" />
      <HealthClient events={events} summary={summary} />
    </div>
  );
}
