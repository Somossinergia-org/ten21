import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { TreasuryType, TreasuryStatus } from "@prisma/client";

export async function listEntries(tenantId: string, statusFilter?: string) {
  return db.treasuryEntry.findMany({
    where: {
      tenantId,
      ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter as TreasuryStatus } : {}),
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function createEntry(tenantId: string, data: {
  type: TreasuryType;
  concept: string;
  amount: number;
  dueDate?: string;
  category?: string;
  notes?: string;
  sourceType?: string;
  sourceId?: string;
  createdById?: string;
}) {
  return db.treasuryEntry.create({
    data: {
      tenantId,
      type: data.type,
      concept: data.concept,
      amount: new Prisma.Decimal(data.amount),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      category: data.category || null,
      notes: data.notes || null,
      sourceType: data.sourceType || "MANUAL",
      sourceId: data.sourceId || null,
      createdById: data.createdById || null,
      status: data.dueDate ? "UPCOMING" : "PENDING",
    },
  });
}

export async function markAsPaid(id: string, tenantId: string, paidDate?: string, notes?: string) {
  const entry = await db.treasuryEntry.findFirst({
    where: { id, tenantId, status: { in: ["PENDING", "UPCOMING", "OVERDUE"] } },
  });
  if (!entry) throw new Error("Entrada no encontrada o ya pagada");

  return db.treasuryEntry.update({
    where: { id },
    data: {
      status: "PAID",
      paidDate: paidDate ? new Date(paidDate) : new Date(),
      notes: notes || entry.notes,
    },
  });
}

export async function cancelEntry(id: string, tenantId: string) {
  return db.treasuryEntry.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}

export async function getForecast(tenantId: string, days: number) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 86400000);

  const entries = await db.treasuryEntry.findMany({
    where: {
      tenantId,
      status: { in: ["PENDING", "UPCOMING"] },
      dueDate: { lte: futureDate },
    },
  });

  let incomeExpected = 0;
  let expenseExpected = 0;

  for (const e of entries) {
    const amt = Number(e.amount);
    if (e.type === "INCOME_EXPECTED" || e.type === "INCOME_CONFIRMED") {
      incomeExpected += amt;
    } else {
      expenseExpected += amt;
    }
  }

  return {
    days,
    income: incomeExpected,
    expense: expenseExpected,
    balance: incomeExpected - expenseExpected,
    entries: entries.length,
  };
}

export async function getSummary(tenantId: string) {
  const now = new Date();

  const [overdue, upcoming7, paid30] = await Promise.all([
    db.treasuryEntry.findMany({
      where: { tenantId, status: { in: ["PENDING", "UPCOMING"] }, dueDate: { lt: now } },
    }),
    db.treasuryEntry.findMany({
      where: {
        tenantId, status: { in: ["PENDING", "UPCOMING"] },
        dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) },
      },
    }),
    db.treasuryEntry.findMany({
      where: {
        tenantId, status: "PAID",
        paidDate: { gte: new Date(now.getTime() - 30 * 86400000) },
      },
    }),
  ]);

  const sumByType = (entries: typeof overdue) => {
    let income = 0, expense = 0;
    for (const e of entries) {
      const amt = Number(e.amount);
      if (e.type.startsWith("INCOME")) income += amt;
      else expense += amt;
    }
    return { income, expense, net: income - expense };
  };

  return {
    overdue: sumByType(overdue),
    upcoming7: sumByType(upcoming7),
    paidLast30: sumByType(paid30),
  };
}

// Auto-generation helpers
export async function createFromSupplierInvoice(tenantId: string, invoiceId: string, concept: string, amount: number, dueDate?: Date) {
  return db.treasuryEntry.create({
    data: {
      tenantId,
      type: "EXPENSE_EXPECTED",
      sourceType: "SUPPLIER_INVOICE",
      sourceId: invoiceId,
      concept,
      amount: new Prisma.Decimal(amount),
      dueDate: dueDate || null,
      status: dueDate ? "UPCOMING" : "PENDING",
    },
  });
}

export async function createFromCustomerInvoice(tenantId: string, invoiceId: string, concept: string, amount: number, dueDate?: Date) {
  return db.treasuryEntry.create({
    data: {
      tenantId,
      type: "INCOME_EXPECTED",
      sourceType: "CUSTOMER_INVOICE",
      sourceId: invoiceId,
      concept,
      amount: new Prisma.Decimal(amount),
      dueDate: dueDate || null,
      status: dueDate ? "UPCOMING" : "PENDING",
    },
  });
}
