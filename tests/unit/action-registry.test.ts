import { describe, it, expect } from "vitest";
import {
  ACTION_REGISTRY, getAction, canAgentExecute,
  needsConfirmation, isForbiddenInRestrictedMode,
} from "@/lib/autonomy/action-registry";

describe("Action Registry", () => {
  it("has 10 initial actions", () => {
    expect(ACTION_REGISTRY.length).toBe(10);
  });

  it("all actions have unique codes", () => {
    const codes = ACTION_REGISTRY.map((a) => a.actionCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("all actions have descriptions", () => {
    for (const a of ACTION_REGISTRY) {
      expect(a.description.length).toBeGreaterThan(10);
    }
  });

  it("getAction finds by code", () => {
    const action = getAction("retry_failed_webhook");
    expect(action?.domain).toBe("automations");
    expect(action?.riskLevel).toBe("MEDIUM");
  });

  it("returns undefined for unknown code", () => {
    expect(getAction("nonexistent")).toBeUndefined();
  });
});

describe("Agent-Action Permissions", () => {
  it("automations agent can retry webhooks", () => {
    expect(canAgentExecute("automations", "retry_failed_webhook")).toBe(true);
  });

  it("sales agent cannot retry webhooks", () => {
    expect(canAgentExecute("sales", "retry_failed_webhook")).toBe(false);
  });

  it("any agent can send internal notification (wildcard)", () => {
    expect(canAgentExecute("sales", "send_internal_notification")).toBe(true);
    expect(canAgentExecute("warehouse", "send_internal_notification")).toBe(true);
    expect(canAgentExecute("security", "send_internal_notification")).toBe(true);
  });

  it("only specific agents can generate export", () => {
    expect(canAgentExecute("compliance", "generate_export")).toBe(true);
    expect(canAgentExecute("support", "generate_export")).toBe(true);
    expect(canAgentExecute("sales", "generate_export")).toBe(false);
  });

  it("postsales can assign priority but not retry webhooks", () => {
    expect(canAgentExecute("postsales", "assign_priority")).toBe(true);
    expect(canAgentExecute("postsales", "retry_failed_webhook")).toBe(false);
  });
});

describe("Confirmation Requirements", () => {
  it("generate_export requires confirmation", () => {
    expect(needsConfirmation("generate_export")).toBe(true);
  });

  it("retry_failed_webhook does NOT require confirmation", () => {
    expect(needsConfirmation("retry_failed_webhook")).toBe(false);
  });

  it("send_internal_notification does NOT require confirmation", () => {
    expect(needsConfirmation("send_internal_notification")).toBe(false);
  });

  it("unknown actions default to requiring confirmation", () => {
    expect(needsConfirmation("unknown_action")).toBe(true);
  });
});

describe("Restricted Mode Awareness", () => {
  it("requeue_automation_message is forbidden in restricted mode", () => {
    expect(isForbiddenInRestrictedMode("requeue_automation_message")).toBe(true);
  });

  it("run_outbound_queue is forbidden in restricted mode", () => {
    expect(isForbiddenInRestrictedMode("run_outbound_queue")).toBe(true);
  });

  it("send_internal_notification is allowed in restricted mode", () => {
    expect(isForbiddenInRestrictedMode("send_internal_notification")).toBe(false);
  });

  it("acknowledge_ai_insight is allowed in restricted mode", () => {
    expect(isForbiddenInRestrictedMode("acknowledge_ai_insight")).toBe(false);
  });
});

describe("Action Properties", () => {
  it("most actions support dry-run", () => {
    const withDryRun = ACTION_REGISTRY.filter((a) => a.dryRunSupported);
    expect(withDryRun.length).toBeGreaterThanOrEqual(7);
  });

  it("most actions are idempotent", () => {
    const idempotent = ACTION_REGISTRY.filter((a) => a.idempotent);
    expect(idempotent.length).toBeGreaterThanOrEqual(6);
  });

  it("HIGH risk actions require confirmation", () => {
    const high = ACTION_REGISTRY.filter((a) => a.riskLevel === "HIGH");
    for (const a of high) {
      expect(a.requiresConfirmation).toBe(true);
    }
  });

  it("LOW risk actions do NOT require confirmation", () => {
    const low = ACTION_REGISTRY.filter((a) => a.riskLevel === "LOW");
    for (const a of low) {
      expect(a.requiresConfirmation).toBe(false);
    }
  });
});
