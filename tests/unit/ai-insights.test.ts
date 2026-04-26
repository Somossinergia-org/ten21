import { describe, it, expect } from "vitest";
import { PRIORITY_BY_SEVERITY } from "@/services/ai-insights.service";

describe("ai-insights V8.2", () => {
  describe("PRIORITY_BY_SEVERITY mapping", () => {
    it("maps AI_INFO → AI_LOW", () => {
      expect(PRIORITY_BY_SEVERITY.AI_INFO).toBe("AI_LOW");
    });
    it("maps AI_WARNING → AI_NORMAL", () => {
      expect(PRIORITY_BY_SEVERITY.AI_WARNING).toBe("AI_NORMAL");
    });
    it("maps AI_HIGH → AI_HIGH", () => {
      expect(PRIORITY_BY_SEVERITY.AI_HIGH).toBe("AI_HIGH");
    });
    it("maps AI_CRITICAL → AI_URGENT", () => {
      expect(PRIORITY_BY_SEVERITY.AI_CRITICAL).toBe("AI_URGENT");
    });
    it("is defined for all 4 severity levels", () => {
      expect(Object.keys(PRIORITY_BY_SEVERITY).sort()).toEqual([
        "AI_CRITICAL",
        "AI_HIGH",
        "AI_INFO",
        "AI_WARNING",
      ]);
    });
  });
});
