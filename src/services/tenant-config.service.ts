import { db } from "@/lib/db";
import type { TenantConfigInput, TenantBrandingInput } from "@/lib/validations/tenant-config";

export async function getConfig(tenantId: string) {
  return db.tenantConfig.findUnique({ where: { tenantId } });
}

export async function upsertConfig(tenantId: string, data: TenantConfigInput) {
  return db.tenantConfig.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export async function getBranding(tenantId: string) {
  return db.tenantBranding.findUnique({ where: { tenantId } });
}

export async function upsertBranding(tenantId: string, data: TenantBrandingInput) {
  return db.tenantBranding.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export async function listModules(tenantId: string) {
  return db.tenantModule.findMany({
    where: { tenantId },
    orderBy: { moduleCode: "asc" },
  });
}

export async function toggleModule(tenantId: string, moduleCode: string, enabled: boolean) {
  return db.tenantModule.upsert({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
    create: { tenantId, moduleCode, enabled },
    update: { enabled },
  });
}

export async function isModuleEnabled(tenantId: string, moduleCode: string): Promise<boolean> {
  const mod = await db.tenantModule.findUnique({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
  });
  return mod?.enabled ?? true; // Default enabled if not configured
}

export async function resolveFeatureFlag(tenantId: string, code: string): Promise<boolean> {
  // 1. Check tenant-specific flag
  const tenantFlag = await db.featureFlag.findFirst({
    where: { code, scope: "TENANT", tenantId },
  });
  if (tenantFlag) return tenantFlag.enabled;

  // 2. Check global flag
  const globalFlag = await db.featureFlag.findFirst({
    where: { code, scope: "GLOBAL", tenantId: null },
  });
  if (globalFlag) return globalFlag.enabled;

  return false; // Default disabled
}

export async function getOnboarding(tenantId: string) {
  return db.tenantOnboarding.findUnique({ where: { tenantId } });
}

export async function upsertOnboarding(tenantId: string, data: {
  status?: string; currentStep?: number; checklistJson?: object; activatedById?: string; completedAt?: Date;
}) {
  return db.tenantOnboarding.upsert({
    where: { tenantId },
    create: {
      tenantId,
      status: (data.status || "NOT_STARTED") as "NOT_STARTED" | "IN_PROGRESS" | "CONFIGURED" | "SEEDED" | "READY" | "LIVE",
      currentStep: data.currentStep ?? 0,
      checklistJson: data.checklistJson as object || undefined,
    },
    update: {
      ...(data.status && { status: data.status as "NOT_STARTED" | "IN_PROGRESS" | "CONFIGURED" | "SEEDED" | "READY" | "LIVE" }),
      ...(data.currentStep !== undefined && { currentStep: data.currentStep }),
      ...(data.checklistJson && { checklistJson: data.checklistJson as object }),
      ...(data.activatedById && { activatedById: data.activatedById }),
      ...(data.completedAt && { completedAt: data.completedAt }),
    },
  });
}

export const ALL_MODULES = [
  { code: "purchases", label: "Compras a proveedor", critical: true },
  { code: "reception", label: "Recepcion de mercancia", critical: true },
  { code: "incidents", label: "Incidencias", critical: false },
  { code: "sales", label: "Ventas", critical: false },
  { code: "inventory", label: "Inventario", critical: false },
  { code: "deliveries", label: "Entregas", critical: true },
  { code: "post_sales", label: "Posventa", critical: false },
  { code: "finance", label: "Finanzas", critical: false },
  { code: "treasury", label: "Tesoreria", critical: false },
  { code: "profitability", label: "Rentabilidad", critical: false },
  { code: "ai", label: "Inteligencia IA", critical: false },
  { code: "automations", label: "Automatizaciones", critical: false },
];
