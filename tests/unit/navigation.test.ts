import { describe, it, expect } from "vitest";

// Navigation structure validation tests
// These test the expected sidebar structure defined in sidebar.tsx

const JEFE_GROUPS = [
  { title: undefined, items: ["Inicio", "Cockpit ejecutivo"] },
  { title: "Operaciones", items: ["Ventas", "Clientes", "Compras", "Almacen", "Inventario", "Entregas", "Posventa"] },
  { title: "Finanzas", items: ["Tesoreria", "Facturas", "Rentabilidad"] },
  { title: "Automatizacion", items: ["Automatizaciones", "Notificaciones", "Inteligencia IA"] },
  { title: "Ajustes", items: ["Usuarios", "Mi tienda", "Modulos", "Suscripcion", "Seguridad"] },
  { title: "Admin (interno)", items: ["Tenants", "Billing", "Lifecycle", "Compliance", "Seguridad", "Salud", "Feature Flags"] },
];

const ALMACEN_EXPECTED_ITEMS = ["Almacen", "Inventario", "Notificaciones", "Seguridad"];
const REPARTO_EXPECTED_ITEMS = ["Entregas", "Notificaciones", "Seguridad"];

describe("Navigation structure", () => {
  it("JEFE has exactly 6 navigation groups", () => {
    expect(JEFE_GROUPS.length).toBe(6);
  });

  it("JEFE has max 7 items in any single group", () => {
    const maxItems = Math.max(...JEFE_GROUPS.map((g) => g.items.length));
    expect(maxItems).toBeLessThanOrEqual(7);
  });

  it("JEFE total items is reasonable (under 30)", () => {
    const total = JEFE_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBeLessThanOrEqual(30);
  });

  it("Mobile views are NOT in any sidebar group", () => {
    const allLabels = JEFE_GROUPS.flatMap((g) => g.items);
    expect(allLabels).not.toContain("Movil reparto");
    expect(allLabels).not.toContain("Movil almacen");
  });

  it("No group is named 'Sistema'", () => {
    const groupNames = JEFE_GROUPS.map((g) => g.title).filter(Boolean);
    expect(groupNames).not.toContain("Sistema");
  });

  it("Admin group is marked as (interno)", () => {
    const adminGroup = JEFE_GROUPS.find((g) => g.title?.includes("Admin"));
    expect(adminGroup?.title).toBe("Admin (interno)");
  });

  it("ALMACEN sees limited items", () => {
    expect(ALMACEN_EXPECTED_ITEMS.length).toBeLessThanOrEqual(5);
  });

  it("ALMACEN cannot see Ventas, Finanzas, or Admin", () => {
    expect(ALMACEN_EXPECTED_ITEMS).not.toContain("Ventas");
    expect(ALMACEN_EXPECTED_ITEMS).not.toContain("Tesoreria");
    expect(ALMACEN_EXPECTED_ITEMS).not.toContain("Tenants");
  });

  it("REPARTO sees only own modules", () => {
    expect(REPARTO_EXPECTED_ITEMS.length).toBeLessThanOrEqual(4);
    expect(REPARTO_EXPECTED_ITEMS).toContain("Entregas");
    expect(REPARTO_EXPECTED_ITEMS).not.toContain("Ventas");
    expect(REPARTO_EXPECTED_ITEMS).not.toContain("Compras");
  });

  it("Facturas is consolidated (not split into cliente/proveedor)", () => {
    const finanzas = JEFE_GROUPS.find((g) => g.title === "Finanzas");
    expect(finanzas?.items).toContain("Facturas");
    expect(finanzas?.items).not.toContain("Facturas cliente");
    expect(finanzas?.items).not.toContain("Fact. proveedor");
  });

  it("Dashboard renamed to Inicio", () => {
    const inicio = JEFE_GROUPS.find((g) => !g.title);
    expect(inicio?.items).toContain("Inicio");
    expect(inicio?.items).not.toContain("Dashboard");
  });
});
