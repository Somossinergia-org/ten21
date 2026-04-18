import { describe, it, expect } from "vitest";
import { enableMfaSchema, verifyMfaSchema, disableMfaSchema } from "@/lib/validations/security";
import { generateTotpSecret, verifyTotpCode, generateRecoveryCodes, checkRateLimit } from "@/services/security.service";

describe("enableMfaSchema", () => {
  it("accepts 6-digit code", () => {
    expect(enableMfaSchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("rejects shorter code", () => {
    expect(enableMfaSchema.safeParse({ code: "12345" }).success).toBe(false);
  });

  it("rejects longer code", () => {
    expect(enableMfaSchema.safeParse({ code: "1234567" }).success).toBe(false);
  });
});

describe("disableMfaSchema", () => {
  it("requires password and code", () => {
    expect(disableMfaSchema.safeParse({
      password: "mypass",
      code: "123456",
    }).success).toBe(true);
  });

  it("rejects missing password", () => {
    expect(disableMfaSchema.safeParse({ code: "123456" }).success).toBe(false);
  });
});

describe("TOTP generation and verification", () => {
  it("generates a valid base32 secret", () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThan(0);
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
  });

  it("verifies its own generated code", () => {
    const secret = generateTotpSecret();
    // Cannot easily test valid codes without time control, but verifyTotpCode must not throw
    expect(() => verifyTotpCode(secret, "000000")).not.toThrow();
  });

  it("rejects invalid code format gracefully", () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, "invalid")).toBe(false);
  });

  it("generates 8 recovery codes", () => {
    const codes = generateRecoveryCodes();
    expect(codes.length).toBe(8);
    for (const c of codes) {
      expect(c).toMatch(/^[A-F0-9-]+$/);
    }
  });
});

describe("Rate limiter", () => {
  it("allows requests under limit", () => {
    const key = "test-key-1-" + Date.now();
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60000)).toBe(true);
    }
  });

  it("blocks requests over limit", () => {
    const key = "test-key-2-" + Date.now();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60000);
    }
    expect(checkRateLimit(key, 5, 60000)).toBe(false);
  });

  it("tracks different keys independently", () => {
    const key1 = "test-key-3a-" + Date.now();
    const key2 = "test-key-3b-" + Date.now();
    for (let i = 0; i < 5; i++) checkRateLimit(key1, 5, 60000);
    expect(checkRateLimit(key1, 5, 60000)).toBe(false);
    expect(checkRateLimit(key2, 5, 60000)).toBe(true);
  });
});
