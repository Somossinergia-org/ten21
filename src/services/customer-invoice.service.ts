import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { CreateCustomerInvoiceInput } from "@/lib/validations/customer-invoice";

async function generateInvoiceNumber(tenantId: string): Promise<string> {
  const last = await db.customerInvoice.findFirst({
    where: { tenantId },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  if (!last) return "FACC-001";
  const num = parseInt(last.invoiceNumber.replace("FACC-", ""), 10);
  return `FACC-${(num + 1).toString().padStart(3, "0")}`;
}

export async function listInvoices(tenantId: string) {
  return db.customerInvoice.findMany({
    where: { tenantId },
    include: {
      customer: { select: { fullName: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string, tenantId: string) {
  return db.customerInvoice.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      salesOrder: { select: { id: true, orderNumber: true, status: true } },
      createdBy: { select: { name: true } },
      lines: true,
    },
  });
}

export async function createInvoice(data: CreateCustomerInvoiceInput, tenantId: string, createdById: string) {
  const invoiceNumber = await generateInvoiceNumber(tenantId);

  let subtotal = 0;
  let taxAmount = 0;
  const lineData = data.lines.map((line) => {
    const lineSubtotal = line.quantity * line.unitPrice;
    const lineTax = lineSubtotal * (line.taxRate / 100);
    const lineTotal = lineSubtotal + lineTax;
    subtotal += lineSubtotal;
    taxAmount += lineTax;
    return {
      salesOrderLineId: line.salesOrderLineId || null,
      description: line.description,
      quantity: line.quantity,
      unitPrice: new Prisma.Decimal(line.unitPrice),
      taxRate: new Prisma.Decimal(line.taxRate),
      lineSubtotal: new Prisma.Decimal(lineSubtotal),
      lineTax: new Prisma.Decimal(lineTax),
      lineTotal: new Prisma.Decimal(lineTotal),
      tenantId,
    };
  });

  const total = subtotal + taxAmount;

  return db.customerInvoice.create({
    data: {
      invoiceNumber,
      customerId: data.customerId,
      salesOrderId: data.salesOrderId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      subtotal: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(taxAmount),
      total: new Prisma.Decimal(total),
      createdById,
      tenantId,
      lines: { create: lineData },
    },
    include: { lines: true },
  });
}

export async function issueInvoice(id: string, tenantId: string) {
  const invoice = await db.customerInvoice.findFirst({
    where: { id, tenantId, status: "DRAFT" },
  });
  if (!invoice) throw new Error("Factura no encontrada o no esta en borrador");
  if (Number(invoice.total) <= 0) throw new Error("La factura debe tener importe positivo");

  return db.customerInvoice.update({
    where: { id },
    data: { status: "ISSUED", issueDate: new Date() },
  });
}

export async function recordPayment(id: string, tenantId: string, amount: number) {
  const invoice = await db.customerInvoice.findFirst({
    where: { id, tenantId, status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
  });
  if (!invoice) throw new Error("Factura no encontrada o no se puede cobrar");

  const newPaid = Number(invoice.paidAmount) + amount;
  const invoiceTotal = Number(invoice.total);
  const isFullyPaid = newPaid >= invoiceTotal;

  return db.customerInvoice.update({
    where: { id },
    data: {
      paidAmount: new Prisma.Decimal(newPaid),
      status: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
      paidAt: isFullyPaid ? new Date() : null,
    },
  });
}

export async function cancelInvoice(id: string, tenantId: string) {
  const invoice = await db.customerInvoice.findFirst({
    where: { id, tenantId, status: { in: ["DRAFT", "ISSUED"] } },
  });
  if (!invoice) throw new Error("Factura no encontrada o no se puede cancelar");

  return db.customerInvoice.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
