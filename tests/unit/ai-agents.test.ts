import { describe, it, expect } from "vitest";
import { AGENT_REGISTRY, getAgentDef, getVisibleAgents, canHandoff } from "@/lib/ai/agents/registry";

describe("Agent Registry V7.95 (8+orchestrator)", () => {
  it("has exactly 9 agents (8 visible + 1 orchestrator)", () => {
    expect(AGENT_REGISTRY.length).toBe(9);
  });

  it("orchestrator is INTERNAL and not visible", () => {
    const orch = getAgentDef("orchestrator");
    expect(orch?.visibility).toBe("INTERNAL");
    expect(orch?.roles).toEqual([]);
  });

  it("8 visible agents for JEFE (no orchestrator)", () => {
    const visible = getVisibleAgents("JEFE", false);
    expect(visible.length).toBe(6); // 6 TENANT-visible for non-superadmin
    const codes = visible.map((a) => a.code);
    expect(codes).not.toContain("orchestrator");
    expect(codes).toContain("executive");
    expect(codes).toContain("sales");
  });

  it("JEFE superAdmin sees 8 agents (6 TENANT + 2 INTERNAL)", () => {
    const visible = getVisibleAgents("JEFE", true);
    expect(visible.length).toBe(8);
    const codes = visible.map((a) => a.code);
    expect(codes).toContain("billing");
    expect(codes).toContain("security");
  });

  it("ALMACEN sees only warehouse agent", () => {
    const visible = getVisibleAgents("ALMACEN", false);
    const codes = visible.map((a) => a.code);
    expect(codes).toContain("warehouse");
    expect(codes).not.toContain("sales");
    expect(codes).not.toContain("billing");
  });

  it("REPARTO sees only delivery agent", () => {
    const visible = getVisibleAgents("REPARTO", false);
    const codes = visible.map((a) => a.code);
    expect(codes).toContain("delivery");
    expect(codes).not.toContain("sales");
  });

  it("eliminated agents are gone", () => {
    const eliminated = ["customers", "inventory", "finance", "invoices", "profitability",
      "postsales", "automations", "compliance", "support"];
    for (const code of eliminated) {
      expect(getAgentDef(code)).toBeUndefined();
    }
  });

  it("purchase agent can handoff to warehouse", () => {
    expect(canHandoff("purchase", "warehouse")).toBe(true);
  });

  it("delivery cannot handoff to billing (cross-domain)", () => {
    expect(canHandoff("delivery", "billing")).toBe(false);
  });

  it("all active agents have missions", () => {
    for (const a of AGENT_REGISTRY) {
      expect(a.mission.length).toBeGreaterThan(10);
    }
  });
});
