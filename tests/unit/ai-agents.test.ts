import { describe, it, expect } from "vitest";
import { AGENT_REGISTRY, getAgentDef, getAgentsForRole, canHandoff } from "@/lib/ai/agents/registry";

describe("Agent Registry", () => {
  it("has 18 agents defined", () => {
    expect(AGENT_REGISTRY.length).toBe(18);
  });

  it("all agents have unique codes", () => {
    const codes = AGENT_REGISTRY.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("all agents have missions", () => {
    for (const a of AGENT_REGISTRY) {
      expect(a.mission.length).toBeGreaterThan(10);
    }
  });

  it("orchestrator can handoff to any agent", () => {
    expect(canHandoff("orchestrator", "sales")).toBe(true);
    expect(canHandoff("orchestrator", "security")).toBe(true);
    expect(canHandoff("orchestrator", "billing")).toBe(true);
  });

  it("sales can handoff to customers but not to security", () => {
    expect(canHandoff("sales", "customers")).toBe(true);
    expect(canHandoff("sales", "security")).toBe(false);
  });

  it("purchases can handoff to warehouse and inventory", () => {
    expect(canHandoff("purchases", "warehouse")).toBe(true);
    expect(canHandoff("purchases", "inventory")).toBe(true);
  });

  it("deliveries can handoff to postsales", () => {
    expect(canHandoff("deliveries", "postsales")).toBe(true);
  });

  it("finance can handoff to treasury, invoices, profitability", () => {
    expect(canHandoff("finance", "treasury")).toBe(true);
    expect(canHandoff("finance", "invoices")).toBe(true);
    expect(canHandoff("finance", "profitability")).toBe(true);
  });

  it("getAgentDef finds by code", () => {
    const sales = getAgentDef("sales");
    expect(sales?.name).toBe("Agente de Ventas");
    expect(sales?.domain).toBe("ventas");
  });

  it("returns undefined for unknown code", () => {
    expect(getAgentDef("nonexistent")).toBeUndefined();
  });

  it("getAgentsForRole JEFE returns all agents", () => {
    const agents = getAgentsForRole("JEFE");
    expect(agents.length).toBe(18);
  });

  it("getAgentsForRole ALMACEN returns limited agents", () => {
    const agents = getAgentsForRole("ALMACEN");
    expect(agents.length).toBeLessThan(18);
    const codes = agents.map((a) => a.code);
    expect(codes).toContain("warehouse");
    expect(codes).toContain("inventory");
    expect(codes).not.toContain("sales");
    expect(codes).not.toContain("finance");
  });

  it("getAgentsForRole REPARTO returns limited agents", () => {
    const agents = getAgentsForRole("REPARTO");
    const codes = agents.map((a) => a.code);
    expect(codes).toContain("deliveries");
    expect(codes).not.toContain("sales");
    expect(codes).not.toContain("billing");
  });

  it("internal agents are visible only to JEFE", () => {
    const internalAgents = AGENT_REGISTRY.filter((a) => a.visibility === "INTERNAL");
    expect(internalAgents.length).toBeGreaterThanOrEqual(4);
    for (const a of internalAgents) {
      expect(a.roles).toContain("JEFE");
      expect(a.roles).not.toContain("ALMACEN");
      expect(a.roles).not.toContain("REPARTO");
    }
  });

  it("cross-domain handoffs are blocked without orchestrator", () => {
    expect(canHandoff("sales", "billing")).toBe(false);
    expect(canHandoff("warehouse", "compliance")).toBe(false);
    expect(canHandoff("deliveries", "billing")).toBe(false);
  });
});
