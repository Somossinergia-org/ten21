import { requireRole } from "@/lib/tenant";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default async function VehiclesPage() {
  await requireRole(["JEFE", "REPARTO"]);

  return (
    <PagePlaceholder
      title="Vehiculos y entregas"
      description="Gestion de vehiculos, repartidores y entregas al cliente. Se implementara en la Fase 5."
    />
  );
}
