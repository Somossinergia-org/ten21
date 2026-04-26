import { requireRole, getTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/page-header";
import * as inventoryService from "@/services/inventory.service";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  await requireRole(["JEFE", "ALMACEN"]);
  const tenantId = await getTenantId();
  const inventory = await inventoryService.listInventory(tenantId);

  return (
    <div>
      <PageHeader title="Inventario" />
      <InventoryClient inventory={inventory} />
    </div>
  );
}
