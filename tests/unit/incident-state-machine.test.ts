import { describe, it, expect } from "vitest";
import { getNextStatuses, isValidTransition } from "@/services/incident.service";

describe("Incident state machine", () => {
  describe("getNextStatuses", () => {
    it("REGISTERED can go to NOTIFIED", () => {
      expect(getNextStatuses("REGISTERED")).toEqual(["NOTIFIED"]);
    });

    it("NOTIFIED can go to REVIEWED", () => {
      expect(getNextStatuses("NOTIFIED")).toEqual(["REVIEWED"]);
    });

    it("REVIEWED can go to CLOSED", () => {
      expect(getNextStatuses("REVIEWED")).toEqual(["CLOSED"]);
    });

    it("CLOSED has no next states", () => {
      expect(getNextStatuses("CLOSED")).toEqual([]);
    });
  });

  describe("isValidTransition", () => {
    // Valid transitions
    it("REGISTERED -> NOTIFIED is valid", () => {
      expect(isValidTransition("REGISTERED", "NOTIFIED")).toBe(true);
    });

    it("NOTIFIED -> REVIEWED is valid", () => {
      expect(isValidTransition("NOTIFIED", "REVIEWED")).toBe(true);
    });

    it("REVIEWED -> CLOSED is valid", () => {
      expect(isValidTransition("REVIEWED", "CLOSED")).toBe(true);
    });

    // Invalid transitions (skipping steps)
    it("REGISTERED -> REVIEWED is invalid (skip)", () => {
      expect(isValidTransition("REGISTERED", "REVIEWED")).toBe(false);
    });

    it("REGISTERED -> CLOSED is invalid (skip)", () => {
      expect(isValidTransition("REGISTERED", "CLOSED")).toBe(false);
    });

    it("NOTIFIED -> CLOSED is invalid (skip)", () => {
      expect(isValidTransition("NOTIFIED", "CLOSED")).toBe(false);
    });

    // Invalid transitions (backwards)
    it("NOTIFIED -> REGISTERED is invalid (backwards)", () => {
      expect(isValidTransition("NOTIFIED", "REGISTERED")).toBe(false);
    });

    it("CLOSED -> REGISTERED is invalid (backwards)", () => {
      expect(isValidTransition("CLOSED", "REGISTERED")).toBe(false);
    });

    it("CLOSED -> REVIEWED is invalid (reopen)", () => {
      expect(isValidTransition("CLOSED", "REVIEWED")).toBe(false);
    });

    // Same state
    it("REGISTERED -> REGISTERED is invalid (no-op)", () => {
      expect(isValidTransition("REGISTERED", "REGISTERED")).toBe(false);
    });
  });
});
