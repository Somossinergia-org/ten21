import { requireRole } from "@/lib/tenant";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default async function PurchasesPage() {
  await requireRole(["JEFE"]);

  return (
    <PagePlaceholder
      title="Compras"
      description="Gestion de pedidos a proveedores. Se implementara en la Fase 3."
    />
  );
}
