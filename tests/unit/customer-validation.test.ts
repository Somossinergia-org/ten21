import { describe, it, expect } from "vitest";
import { createCustomerSchema, updateCustomerSchema } from "@/lib/validations/customer";

describe("createCustomerSchema", () => {
  it("accepts valid customer data", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "Carmen Rodriguez",
      phone: "658 112 233",
      addressLine1: "C/ Mayor 15, 2ºB, Guardamar del Segura",
      city: "Guardamar",
    });
    expect(result.success).toBe(true);
  });

  it("requires fullName", () => {
    const result = createCustomerSchema.safeParse({
      addressLine1: "C/ Mayor 15",
    });
    expect(result.success).toBe(false);
  });

  it("requires addressLine1", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "Test Customer",
    });
    expect(result.success).toBe(false);
  });

  it("allows minimal data (name + address only)", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "Test",
      addressLine1: "C/ Test 1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty fullName", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "",
      addressLine1: "C/ Test 1",
    });
    expect(result.success).toBe(false);
  });

  it("validates email format when provided", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "Test",
      addressLine1: "C/ Test 1",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty email", () => {
    const result = createCustomerSchema.safeParse({
      fullName: "Test",
      addressLine1: "C/ Test 1",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCustomerSchema", () => {
  it("requires id", () => {
    const result = updateCustomerSchema.safeParse({
      fullName: "Updated Name",
    });
    expect(result.success).toBe(false);
  });

  it("accepts partial update with id", () => {
    const result = updateCustomerSchema.safeParse({
      id: "cuid123",
      fullName: "Updated Name",
    });
    expect(result.success).toBe(true);
  });
});
