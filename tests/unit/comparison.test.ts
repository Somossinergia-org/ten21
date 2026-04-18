import { describe, it, expect } from "vitest";
import { compareLineForIncidents } from "@/services/reception.service";

describe("compareLineForIncidents", () => {
  const ref = "LAV-001";
  const name = "Lavadora Samsung 8kg";

  it("returns empty array when quantities match exactly", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 3, quantityReceived: 3, quantityDamaged: 0 },
      ref,
      name,
    );
    expect(result).toEqual([]);
  });

  it("returns QUANTITY_MISMATCH when received less than expected", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 5, quantityReceived: 3, quantityDamaged: 0 },
      ref,
      name,
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("QUANTITY_MISMATCH");
    expect(result[0].description).toContain("faltan 2");
    expect(result[0].description).toContain("se esperaban 5");
    expect(result[0].description).toContain("se recibieron 3");
  });

  it("returns QUANTITY_MISMATCH when received more than expected", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 2, quantityReceived: 4, quantityDamaged: 0 },
      ref,
      name,
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("QUANTITY_MISMATCH");
    expect(result[0].description).toContain("sobran 2");
  });

  it("returns DAMAGED when quantityDamaged > 0", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 3, quantityReceived: 3, quantityDamaged: 1 },
      ref,
      name,
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("DAMAGED");
    expect(result[0].description).toContain("1 unidad(es)");
  });

  it("returns both QUANTITY_MISMATCH and DAMAGED when both apply", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 5, quantityReceived: 3, quantityDamaged: 2 },
      ref,
      name,
    );
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("QUANTITY_MISMATCH");
    expect(result[1].type).toBe("DAMAGED");
  });

  it("returns empty when received 0 of 0 expected", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 0, quantityReceived: 0, quantityDamaged: 0 },
      ref,
      name,
    );
    expect(result).toEqual([]);
  });

  it("returns QUANTITY_MISMATCH when received 0 of expected > 0", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 3, quantityReceived: 0, quantityDamaged: 0 },
      ref,
      name,
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("QUANTITY_MISMATCH");
    expect(result[0].description).toContain("faltan 3");
  });

  it("includes product ref and name in description", () => {
    const result = compareLineForIncidents(
      { purchaseOrderLineId: "x", quantityExpected: 1, quantityReceived: 0, quantityDamaged: 0 },
      "FRI-001",
      "Frigorifico Bosch",
    );
    expect(result[0].description).toContain("FRI-001");
    expect(result[0].description).toContain("Frigorifico Bosch");
  });
});
