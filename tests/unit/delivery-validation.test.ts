import { describe, it, expect } from "vitest";
import { createDeliverySchema, deliveryLineInputSchema } from "@/lib/validations/delivery";

describe("deliveryLineInputSchema", () => {
  it("accepts valid line", () => {
    const result = deliveryLineInputSchema.safeParse({
      description: "Sofa 3 plazas",
      quantity: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts line with productId", () => {
    const result = deliveryLineInputSchema.safeParse({
      productId: "prod123",
      description: "Sofa 3 plazas",
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = deliveryLineInputSchema.safeParse({
      description: "",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity 0", () => {
    const result = deliveryLineInputSchema.safeParse({
      description: "Test",
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createDeliverySchema with customerId and lines", () => {
  it("accepts delivery with customerId", () => {
    const result = createDeliverySchema.safeParse({
      customerId: "cust123",
      customerName: "Carmen Rodriguez",
      customerAddress: "C/ Mayor 15",
      description: "Sofa 3 plazas",
      vehicleId: "v1",
      assignedToId: "u1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBe("cust123");
    }
  });

  it("accepts delivery without customerId (backward compat)", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "Carmen Rodriguez",
      customerAddress: "C/ Mayor 15",
      description: "Sofa 3 plazas",
      vehicleId: "v1",
      assignedToId: "u1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts delivery with lines", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "Test",
      customerAddress: "C/ Test",
      description: "Entrega completa",
      vehicleId: "v1",
      assignedToId: "u1",
      lines: [
        { description: "Sofa 3 plazas", quantity: 1 },
        { productId: "p1", description: "Mesa comedor", quantity: 1 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lines?.length).toBe(2);
    }
  });

  it("accepts delivery without lines (backward compat)", () => {
    const result = createDeliverySchema.safeParse({
      customerName: "Test",
      customerAddress: "C/ Test",
      description: "Entrega simple",
      vehicleId: "v1",
      assignedToId: "u1",
    });
    expect(result.success).toBe(true);
  });
});
