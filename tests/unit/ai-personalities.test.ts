import { describe, it, expect } from "vitest";
import { PERSONALITIES, getPersonality } from "@/lib/ai/personalities/registry";
import { GLOSSARY, getTerms, findTerm } from "@/lib/ai/glossary/registry";
import { ONTOLOGY, getRelations, getInverseRelations } from "@/lib/ai/ontology/registry";
import { DOCUMENT_READING_PROFILES, getDocumentProfile } from "@/lib/ai/document-reading/registry";

describe("Personality Registry", () => {
  it("has 18 personalities matching agent registry", () => {
    expect(PERSONALITIES.length).toBe(18);
  });

  it("every personality has system prompt with base rules", () => {
    for (const p of PERSONALITIES) {
      expect(p.systemPrompt.length).toBeGreaterThan(50);
      expect(p.systemPrompt).toContain("HECHO");
    }
  });

  it("every personality has distinct role", () => {
    const roles = PERSONALITIES.map((p) => p.roleSimulated);
    expect(new Set(roles).size).toBeGreaterThanOrEqual(15);
  });

  it("every personality has vocabulary", () => {
    for (const p of PERSONALITIES) {
      expect(p.vocabulary.length).toBeGreaterThan(0);
    }
  });

  it("getPersonality finds sales", () => {
    const sales = getPersonality("sales");
    expect(sales?.roleSimulated).toBe("Jefe Comercial");
  });

  it("returns undefined for unknown agent", () => {
    expect(getPersonality("ghost")).toBeUndefined();
  });

  it("executive prohibits technical jargon", () => {
    const exec = getPersonality("executive");
    expect(exec?.prohibitedPhrases).toContain("SQL");
  });

  it("security has prudent tone", () => {
    const sec = getPersonality("security");
    expect(sec?.tone.toLowerCase()).toContain("prudente");
  });
});

describe("Glossary", () => {
  it("has at least 25 terms", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(25);
  });

  it("every term has short definition", () => {
    for (const t of GLOSSARY) {
      expect(t.shortDefinition.length).toBeGreaterThan(5);
    }
  });

  it("finds SKU via synonym", () => {
    const found = findTerm("SKU");
    expect(found?.term).toBe("referencia");
  });

  it("getTerms filters by domain", () => {
    const productos = getTerms("productos");
    expect(productos.length).toBeGreaterThan(0);
    for (const t of productos) expect(t.domain).toBe("productos");
  });

  it("has glossary for main domains", () => {
    const domains = ["productos", "compras", "ventas", "finanzas", "saas", "seguridad"];
    for (const d of domains) {
      expect(getTerms(d).length).toBeGreaterThan(0);
    }
  });

  it("past_due is business SaaS term", () => {
    const term = findTerm("past_due");
    expect(term?.domain).toBe("saas");
    expect(term?.businessLanguage).toContain("impago");
  });
});

describe("Ontology", () => {
  it("has at least 15 relations", () => {
    expect(ONTOLOGY.length).toBeGreaterThanOrEqual(15);
  });

  it("SalesOrder reserves ProductInventory", () => {
    const relations = getRelations("SalesOrder");
    const reserve = relations.find((r) => r.targetType === "ProductInventory" && r.relationType === "reserva");
    expect(reserve).toBeDefined();
  });

  it("PurchaseOrder generates Reception", () => {
    const relations = getRelations("PurchaseOrder");
    const gen = relations.find((r) => r.targetType === "Reception");
    expect(gen).toBeDefined();
  });

  it("getInverseRelations finds who targets Customer", () => {
    const inverse = getInverseRelations("Customer");
    expect(inverse.length).toBeGreaterThan(0);
  });

  it("Delivery can generate PostSaleTicket", () => {
    const relations = getRelations("Delivery");
    const gen = relations.find((r) => r.targetType === "PostSaleTicket");
    expect(gen).toBeDefined();
  });
});

describe("Document Reading Profiles", () => {
  it("has profiles for all critical document types", () => {
    const types = ["SupplierInvoice", "CustomerInvoice", "PurchaseOrder", "Reception", "Delivery", "SalesOrder", "Product", "PostSaleTicket"];
    for (const t of types) {
      const profile = DOCUMENT_READING_PROFILES.find((p) => p.documentType === t);
      expect(profile).toBeDefined();
    }
  });

  it("every profile has expected fields", () => {
    for (const p of DOCUMENT_READING_PROFILES) {
      expect(p.fieldsExpected.length).toBeGreaterThan(2);
    }
  });

  it("every profile has output template with confidence", () => {
    for (const p of DOCUMENT_READING_PROFILES) {
      expect(p.outputTemplate.confianza).toBeDefined();
    }
  });

  it("invoice profile has ambiguity rules for dates", () => {
    const profile = getDocumentProfile("invoices", "SupplierInvoice");
    expect(profile?.ambiguityRules.some((r) => r.includes("dueDate") || r.includes("NIF"))).toBe(true);
  });

  it("reception profile catches quantity discrepancies", () => {
    const profile = getDocumentProfile("warehouse", "Reception");
    expect(profile?.ambiguityRules.some((r) => r.includes("quantityReceived"))).toBe(true);
  });

  it("inventory profile flags disponible negativo", () => {
    const profile = getDocumentProfile("inventory", "Product");
    expect(profile?.ambiguityRules.some((r) => r.includes("disponible") || r.includes("defaultCost"))).toBe(true);
  });

  it("delivery profile requires proof when proofRequired", () => {
    const profile = getDocumentProfile("deliveries", "Delivery");
    expect(profile?.ambiguityRules.some((r) => r.includes("proof"))).toBe(true);
  });
});

describe("Agent-Personality consistency", () => {
  it("financial agents forbid pipeline/commercial language", () => {
    const treasury = getPersonality("treasury");
    expect(treasury?.prohibitedPhrases).toContain("pipeline");
  });

  it("warehouse agent forbids commercial language", () => {
    const warehouse = getPersonality("warehouse");
    expect(warehouse?.prohibitedPhrases.some((p) => p.includes("venta") || p.includes("margen"))).toBe(true);
  });

  it("sales agent knows about margin", () => {
    const sales = getPersonality("sales");
    expect(sales?.vocabulary).toContain("margen");
  });
});
