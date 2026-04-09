"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getCurrentUser } from "@/lib/tenant";
import { transitionIncidentSchema } from "@/lib/validations/incident";
import * as incidentService from "@/services/incident.service";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function transitionIncidentAction(data: {
  incidentId: string;
  newStatus: "NOTIFIED" | "REVIEWED" | "CLOSED";
  resolution?: string;
}): Promise<ActionResult> {
  await requireRole(["JEFE"]);
  const user = await getCurrentUser();

  // Validate input shape
  const parsed = transitionIncidentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Service validates the actual state transition
  try {
    await incidentService.transitionIncident(
      parsed.data.incidentId,
      user.tenantId,
      parsed.data.newStatus,
      user.id,
      parsed.data.resolution,
    );

    revalidatePath(`/incidents/${parsed.data.incidentId}`);
    revalidatePath("/incidents");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al cambiar el estado";
    return { success: false, error: msg };
  }
}
