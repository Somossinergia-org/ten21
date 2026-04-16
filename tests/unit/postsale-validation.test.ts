import { describe, it, expect } from "vitest";
import { createPostSaleTicketSchema, transitionPostSaleTicketSchema, postSaleTicketTypeEnum, postSaleTicketStatusEnum } from "@/lib/validations/post-sales";
import { isValidTransition } from "@/services/postsale.service";

describe("postSaleTicketTypeEnum", () => {
  it("accepts all valid types", () => {
    for (const t of ["DAMAGE", "MISSING_ITEM", "INSTALLATION", "WARRANTY", "RETURN", "OTHER"]) {
      expect(postSaleTicketTypeEnum.safeParse(t).success).toBe(true);
    }
  });
  it("rejects invalid type", () => {
    expect(postSaleTicketTypeEnum.safeParse("UNKNOWN").success).toBe(false);
  });
});

describe("createPostSaleTicketSchema", () => {
  it("accepts valid ticket", () => {
    const result = createPostSaleTicketSchema.safeParse({
      customerId: "cust123",
      type: "DAMAGE",
      description: "Sofa llego con rasgadura en la tela lateral",
    });
    expect(result.success).toBe(true);
  });

  it("defaults priority to NORMAL", () => {
    const result = createPostSaleTicketSchema.safeParse({
      customerId: "cust123",
      type: "WARRANTY",
      description: "Motor de lavadora no arranca",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("NORMAL");
    }
  });

  it("requires description", () => {
    const result = createPostSaleTicketSchema.safeParse({
      customerId: "cust123",
      type: "DAMAGE",
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional links", () => {
    const result = createPostSaleTicketSchema.safeParse({
      customerId: "cust123",
      salesOrderId: "so123",
      deliveryId: "del123",
      type: "MISSING_ITEM",
      priority: "HIGH",
      description: "Falta pata de mesa",
      assignedToId: "user123",
    });
    expect(result.success).toBe(true);
  });
});

describe("transitionPostSaleTicketSchema", () => {
  it("accepts valid transition", () => {
    const result = transitionPostSaleTicketSchema.safeParse({
      ticketId: "t123",
      newStatus: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("accepts CLOSED with resolution", () => {
    const result = transitionPostSaleTicketSchema.safeParse({
      ticketId: "t123",
      newStatus: "CLOSED",
      resolution: "Proveedor envio pieza de repuesto",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = transitionPostSaleTicketSchema.safeParse({
      ticketId: "t123",
      newStatus: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("PostSaleTicket state machine", () => {
  it("OPEN can transition to IN_PROGRESS", () => {
    expect(isValidTransition("OPEN", "IN_PROGRESS")).toBe(true);
  });

  it("OPEN can transition to CLOSED", () => {
    expect(isValidTransition("OPEN", "CLOSED")).toBe(true);
  });

  it("CLOSED cannot transition anywhere", () => {
    expect(isValidTransition("CLOSED", "OPEN")).toBe(false);
    expect(isValidTransition("CLOSED", "IN_PROGRESS")).toBe(false);
  });

  it("IN_PROGRESS can go to WAITING_SUPPLIER", () => {
    expect(isValidTransition("IN_PROGRESS", "WAITING_SUPPLIER")).toBe(true);
  });

  it("WAITING_SUPPLIER can go back to IN_PROGRESS", () => {
    expect(isValidTransition("WAITING_SUPPLIER", "IN_PROGRESS")).toBe(true);
  });

  it("RESOLVED can only go to CLOSED", () => {
    expect(isValidTransition("RESOLVED", "CLOSED")).toBe(true);
    expect(isValidTransition("RESOLVED", "OPEN")).toBe(false);
    expect(isValidTransition("RESOLVED", "IN_PROGRESS")).toBe(false);
  });
});
