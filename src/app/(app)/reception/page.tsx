import { requireRole } from "@/lib/tenant";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default async function ReceptionPage() {
  await requireRole(["JEFE", "ALMACEN"]);

  return (
    <PagePlaceholder
      title="Recepcion"
      description="Registro de albaranes y comparacion automatica con pedidos. Se implementara en la Fase 4."
    />
  );
}
