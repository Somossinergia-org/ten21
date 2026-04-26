import { describe, it, expect } from "vitest";
import { createProofSchema } from "@/lib/validations/proof";

describe("createProofSchema", () => {
  it("accepts photo proof", () => {
    const result = createProofSchema.safeParse({
      deliveryId: "del123",
      type: "PHOTO",
      fileDataUrl: "data:image/jpeg;base64,abc123",
      fileName: "foto.jpg",
      requestId: "req-uuid-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts note proof", () => {
    const result = createProofSchema.safeParse({
      deliveryId: "del123",
      type: "NOTE",
      note: "Cliente confirma recepcion en porteria",
    });
    expect(result.success).toBe(true);
  });

  it("accepts GPS snapshot", () => {
    const result = createProofSchema.safeParse({
      deliveryId: "del123",
      type: "GPS_SNAPSHOT",
      latitude: 38.0893,
      longitude: -0.6577,
    });
    expect(result.success).toBe(true);
  });

  it("accepts signature", () => {
    const result = createProofSchema.safeParse({
      deliveryId: "del123",
      type: "SIGNATURE",
      fileDataUrl: "data:image/png;base64,sig",
      fileName: "firma.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(createProofSchema.safeParse({
      deliveryId: "del123",
      type: "INVALID",
    }).success).toBe(false);
  });

  it("requires deliveryId", () => {
    expect(createProofSchema.safeParse({
      type: "NOTE",
      note: "test",
    }).success).toBe(false);
  });
});
