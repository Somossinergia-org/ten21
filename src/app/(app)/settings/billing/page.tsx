import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as billingService from "@/services/billing.service";
import * as usageService from "@/services/usage.service";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  await requireRole(["JEFE"]);
  const tenantId = await getTenantId();

  const [subscription, plans, invoices, usage, warnings] = await Promise.all([
    billingService.getTenantSubscription(tenantId),
    billingService.listPlans(),
    billingService.listInvoices(tenantId),
    usageService.getCurrentUsage(tenantId),
    usageService.checkLimitWarnings(tenantId),
  ]);

  return (
    <div>
      <PageHeader title="Suscripcion y facturacion" />
      <BillingClient
        subscription={subscription}
        plans={plans}
        invoices={invoices}
        usage={usage}
        warnings={warnings}
      />
    </div>
  );
}
