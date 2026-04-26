import { describe, it, expect } from "vitest";
import { parseCognitive, hasCognitiveStructure } from "@/lib/ai/cognitive-parser";

describe("cognitive-parser", () => {
  it("returns empty structure for empty input", () => {
    const r = parseCognitive("");
    expect(r.facts).toEqual([]);
    expect(r.inferences).toEqual([]);
    expect(r.recommendations).toEqual([]);
    expect(r.other).toBe("");
  });

  it("parses plain HECHO/INFERENCIA/RECOMENDACION prefixes", () => {
    const text = [
      "HECHO: 5 pagos vencidos",
      "INFERENCIA: tensión de caja posible",
      "RECOMENDACION: priorizar liquidación",
    ].join("\n");
    const r = parseCognitive(text);
    expect(r.facts).toEqual(["5 pagos vencidos"]);
    expect(r.inferences).toEqual(["tensión de caja posible"]);
    expect(r.recommendations).toEqual(["priorizar liquidación"]);
    expect(r.other).toBe("");
  });

  it("handles bullet and markdown wrappers", () => {
    const text = [
      "• HECHO: X",
      "1. INFERENCIA: Y",
      "**RECOMENDACIÓN:** Z",
    ].join("\n");
    const r = parseCognitive(text);
    expect(r.facts).toEqual(["X"]);
    expect(r.inferences).toEqual(["Y"]);
    expect(r.recommendations).toEqual(["Z"]);
  });

  it("continues a bucket across bullet lines until empty or new prefix", () => {
    const text = [
      "HECHOS:",
      "- 5 pagos vencidos",
      "- 3 cobros vencidos",
      "",
      "RECOMENDACIONES:",
      "- Priorizar liquidación",
    ].join("\n");
    const r = parseCognitive(text);
    expect(r.facts).toEqual(["5 pagos vencidos", "3 cobros vencidos"]);
    expect(r.recommendations).toEqual(["Priorizar liquidación"]);
  });

  it("captures unmatched text under 'other'", () => {
    const r = parseCognitive("Resumen libre del agente.\n\nHECHO: 1");
    expect(r.facts).toEqual(["1"]);
    expect(r.other).toContain("Resumen libre del agente");
  });

  it("hasCognitiveStructure detects any prefix", () => {
    expect(hasCognitiveStructure("HECHO: x")).toBe(true);
    expect(hasCognitiveStructure("• INFERENCIA: y")).toBe(true);
    expect(hasCognitiveStructure("**RECOMENDACIÓN:** z")).toBe(true);
    expect(hasCognitiveStructure("solo texto")).toBe(false);
  });

  it("is case-insensitive on prefix", () => {
    const r = parseCognitive("hecho: minúsculas\nInferencia: mixto\nRECOMENDACION: mayúsculas");
    expect(r.facts).toEqual(["minúsculas"]);
    expect(r.inferences).toEqual(["mixto"]);
    expect(r.recommendations).toEqual(["mayúsculas"]);
  });
});
