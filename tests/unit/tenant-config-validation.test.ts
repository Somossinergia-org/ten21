import { describe, it, expect } from "vitest";
import { tenantConfigSchema, tenantBrandingSchema, toggleModuleSchema } from "@/lib/validations/tenant-config";

describe("tenantConfigSchema", () => {
  it("accepts valid config", () => {
    const result = tenantConfigSchema.safeParse({
      businessName: "Muebles Garcia S.L.",
      taxId: "B12345678",
      phone: "966 123 456",
      city: "Alicante",
    });
    expect(result.success).toBe(true);
  });

  it("requires businessName", () => {
    expect(tenantConfigSchema.safeParse({}).success).toBe(false);
  });

  it("defaults country to ES", () => {
    const result = tenantConfigSchema.safeParse({ businessName: "Test" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.country).toBe("ES");
  });

  it("defaults timezone to Europe/Madrid", () => {
    const result = tenantConfigSchema.safeParse({ businessName: "Test" });
    if (result.success) expect(result.data.timezone).toBe("Europe/Madrid");
  });
});

describe("tenantBrandingSchema", () => {
  it("accepts valid branding", () => {
    expect(tenantBrandingSchema.safeParse({
      appName: "Mi Tienda",
      primaryColor: "#06b6d4",
    }).success).toBe(true);
  });

  it("accepts empty branding", () => {
    expect(tenantBrandingSchema.safeParse({}).success).toBe(true);
  });
});

describe("toggleModuleSchema", () => {
  it("accepts valid toggle", () => {
    expect(toggleModuleSchema.safeParse({
      moduleCode: "sales",
      enabled: true,
    }).success).toBe(true);
  });

  it("rejects empty moduleCode", () => {
    expect(toggleModuleSchema.safeParse({
      moduleCode: "",
      enabled: true,
    }).success).toBe(false);
  });
});
