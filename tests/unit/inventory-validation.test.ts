import { describe, it, expect } from "vitest";
import { manualAdjustmentSchema } from "@/lib/validations/inventory";

describe("manualAdjustmentSchema", () => {
  it("accepts positive adjustment", () => {
    const result = manualAdjustmentSchema.safeParse({
      productId: "prod123",
      quantity: 5,
      notes: "Inventario fisico — sobrante encontrado",
    });
    expect(result.success).toBe(true);
  });

  it("accepts negative adjustment", () => {
    const result = manualAdjustmentSchema.safeParse({
      productId: "prod123",
      quantity: -3,
      notes: "Rotura en almacen",
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity 0", () => {
    const result = manualAdjustmentSchema.safeParse({
      productId: "prod123",
      quantity: 0,
      notes: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("requires notes", () => {
    const result = manualAdjustmentSchema.safeParse({
      productId: "prod123",
      quantity: 1,
      notes: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires productId", () => {
    const result = manualAdjustmentSchema.safeParse({
      quantity: 1,
      notes: "Test",
    });
    expect(result.success).toBe(false);
  });
});
