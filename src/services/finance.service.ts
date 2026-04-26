import { db } from "@/lib/db";

export async function listInvoices(tenantId: string) {
  return db.supplierInvoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoiceFromExtraction(
  tenantId: string,
  data: {
    invoiceNumber?: string;
    supplierName?: string;
    supplierNif?: string;
    concept?: string;
    baseAmount?: number;
    taxAmount?: number;
    totalAmount?: number;
    taxRate?: number;
    invoiceDate?: string;
    dueDate?: string;
    pdfDataUrl?: string;
    extractedData?: Record<string, unknown>;
    createdById?: string;
  },
) {
  return db.supplierInvoice.create({
    data: {
      tenantId,
      invoiceNumber: data.invoiceNumber || null,
      supplierName: data.supplierName || null,
      supplierNif: data.supplierNif || null,
      concept: data.concept || null,
      baseAmount: data.baseAmount ?? null,
      taxAmount: data.taxAmount ?? null,
      totalAmount: data.totalAmount ?? null,
      taxRate: data.taxRate ?? null,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      pdfDataUrl: data.pdfDataUrl || null,
      extractedData: (data.extractedData as object) ?? undefined,
      createdById: data.createdById || null,
      status: "PENDING",
    },
  });
}

export async function getIvaSummary(tenantId: string, year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59);

  const invoices = await db.supplierInvoice.findMany({
    where: {
      tenantId,
      invoiceDate: { gte: start, lte: end },
    },
    orderBy: { invoiceDate: "asc" },
  });

  let totalBase = 0;
  let totalTax = 0;
  let totalAmount = 0;
  const byMonth: { month: string; base: number; tax: number; total: number; count: number }[] = [];

  for (let m = 0; m < 3; m++) {
    const monthStart = new Date(year, startMonth + m, 1);
    const monthEnd = new Date(year, startMonth + m + 1, 0, 23, 59, 59);
    const monthInvs = invoices.filter((i) => i.invoiceDate && i.invoiceDate >= monthStart && i.invoiceDate <= monthEnd);

    const mBase = monthInvs.reduce((s, i) => s + Number(i.baseAmount || 0), 0);
    const mTax = monthInvs.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
    const mTotal = monthInvs.reduce((s, i) => s + Number(i.totalAmount || 0), 0);

    byMonth.push({
      month: monthStart.toLocaleString("es-ES", { month: "long" }),
      base: mBase, tax: mTax, total: mTotal, count: monthInvs.length,
    });

    totalBase += mBase;
    totalTax += mTax;
    totalAmount += mTotal;
  }

  return {
    year, quarter,
    totalBase: Math.round(totalBase * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    invoiceCount: invoices.length,
    byMonth,
  };
}

export async function getInvoiceAlerts(tenantId: string) {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 86400000);

  const invoices = await db.supplierInvoice.findMany({
    where: { tenantId, status: { in: ["PENDING", "MISMATCH"] } },
    orderBy: { dueDate: "asc" },
  });

  const alerts: { type: string; severity: string; invoice: string; supplier: string; amount: number; dueDate: string | null; daysOverdue?: number }[] = [];

  for (const inv of invoices) {
    if (inv.dueDate && inv.dueDate < now) {
      const days = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
      alerts.push({
        type: "overdue", severity: "high",
        invoice: inv.invoiceNumber || inv.id,
        supplier: inv.supplierName || "Desconocido",
        amount: Number(inv.totalAmount || 0),
        dueDate: inv.dueDate.toLocaleDateString("es-ES"),
        daysOverdue: days,
      });
    } else if (inv.dueDate && inv.dueDate <= sevenDays) {
      alerts.push({
        type: "due_soon", severity: "medium",
        invoice: inv.invoiceNumber || inv.id,
        supplier: inv.supplierName || "Desconocido",
        amount: Number(inv.totalAmount || 0),
        dueDate: inv.dueDate.toLocaleDateString("es-ES"),
      });
    }

    if (inv.status === "MISMATCH") {
      alerts.push({
        type: "mismatch", severity: "high",
        invoice: inv.invoiceNumber || inv.id,
        supplier: inv.supplierName || "Desconocido",
        amount: Number(inv.totalAmount || 0),
        dueDate: inv.dueDate?.toLocaleDateString("es-ES") || null,
      });
    }
  }

  return alerts;
}

export async function getExpenseSummary(tenantId: string) {
  const invoices = await db.supplierInvoice.findMany({
    where: { tenantId },
    orderBy: { invoiceDate: "asc" },
  });

  // Group by supplier
  const bySupplier: Record<string, { count: number; total: number }> = {};
  for (const inv of invoices) {
    const key = inv.supplierName || "Desconocido";
    if (!bySupplier[key]) bySupplier[key] = { count: 0, total: 0 };
    bySupplier[key].count++;
    bySupplier[key].total += Number(inv.totalAmount || 0);
  }

  return {
    totalInvoices: invoices.length,
    totalAmount: Math.round(invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0) * 100) / 100,
    totalPending: invoices.filter((i) => i.status === "PENDING").length,
    totalPaid: invoices.filter((i) => i.status === "PAID").length,
    bySupplier: Object.entries(bySupplier).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total),
  };
}
