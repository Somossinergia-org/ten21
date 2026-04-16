-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'VALIDATED', 'MISMATCH', 'PAID');

-- CreateTable
CREATE TABLE "SupplierInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "supplierId" TEXT,
    "supplierName" TEXT,
    "supplierNif" TEXT,
    "purchaseOrderId" TEXT,
    "concept" TEXT,
    "baseAmount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "totalAmount" DECIMAL(65,30),
    "taxRate" DECIMAL(65,30),
    "invoiceDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "pdfDataUrl" TEXT,
    "extractedData" JSONB,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierInvoice_tenantId_idx" ON "SupplierInvoice"("tenantId");
CREATE INDEX "SupplierInvoice_tenantId_status_idx" ON "SupplierInvoice"("tenantId", "status");
CREATE INDEX "SupplierInvoice_tenantId_dueDate_idx" ON "SupplierInvoice"("tenantId", "dueDate");
