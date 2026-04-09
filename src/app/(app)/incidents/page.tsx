import { requireRole } from "@/lib/tenant";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default async function IncidentsPage() {
  await requireRole(["JEFE", "ALMACEN"]);

  return (
    <PagePlaceholder
      title="Incidencias"
      description="Gestion de incidencias detectadas en recepciones. Se implementara en la Fase 4."
    />
  );
}
