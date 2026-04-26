-- CreateEnum
CREATE TYPE "CustomerInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TreasuryType" AS ENUM ('INCOME_EXPECTED', 'INCOME_CONFIRMED', 'EXPENSE_EXPECTED', 'EXPENSE_CONFIRMED');

-- CreateEnum
CREATE TYPE "TreasuryStatus" AS ENUM ('PENDING', 'UPCOMING', 'PAID', 'OVERDUE', 'CANCELLED');

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "paymentStatus" TEXT DEFAULT 'UNBILLED',
ADD COLUMN     "realMargin" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "SupplierInvoice" ADD COLUMN     "paidDate" TIMESTAMP(3),
ADD COLUMN     "varianceAmount" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "CustomerInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "status" "CustomerInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInvoiceLine" (
    "id" TEXT NOT NULL,
    "customerInvoiceId" TEXT NOT NULL,
    "salesOrderLineId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 21,
    "lineSubtotal" DECIMAL(65,30) NOT NULL,
    "lineTax" DECIMAL(65,30) NOT NULL,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "CustomerInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TreasuryType" NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "category" TEXT,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "status" "TreasuryStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreasuryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerInvoice_tenantId_idx" ON "CustomerInvoice"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerInvoice_tenantId_status_idx" ON "CustomerInvoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CustomerInvoice_customerId_idx" ON "CustomerInvoice"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInvoice_tenantId_invoiceNumber_key" ON "CustomerInvoice"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "CustomerInvoiceLine_customerInvoiceId_idx" ON "CustomerInvoiceLine"("customerInvoiceId");

-- CreateIndex
CREATE INDEX "TreasuryEntry_tenantId_idx" ON "TreasuryEntry"("tenantId");

-- CreateIndex
CREATE INDEX "TreasuryEntry_tenantId_status_idx" ON "TreasuryEntry"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TreasuryEntry_tenantId_dueDate_idx" ON "TreasuryEntry"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "TreasuryEntry_sourceType_sourceId_idx" ON "TreasuryEntry"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "CustomerInvoice" ADD CONSTRAINT "CustomerInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInvoice" ADD CONSTRAINT "CustomerInvoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInvoice" ADD CONSTRAINT "CustomerInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInvoice" ADD CONSTRAINT "CustomerInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInvoiceLine" ADD CONSTRAINT "CustomerInvoiceLine_customerInvoiceId_fkey" FOREIGN KEY ("customerInvoiceId") REFERENCES "CustomerInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasuryEntry" ADD CONSTRAINT "TreasuryEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
