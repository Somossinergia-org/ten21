import { db } from "@/lib/db";
import type { CreatePurchaseOrderInput } from "@/lib/validations/purchase";
import type { CreateProductInput } from "@/lib/validations/product";
import type { CreateSupplierInput } from "@/lib/validations/supplier";
import type { PurchaseStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ============================================================
// ORDER NUMBER GENERATION
// ============================================================

async function generateOrderNumber(tenantId: string): Promise<string> {
  const lastOrder = await db.purchaseOrder.findFirst({
    where: { tenantId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "PED-001";
  }

  const lastNum = parseInt(lastOrder.orderNumber.replace("PED-", ""), 10);
  const nextNum = (lastNum + 1).toString().padStart(3, "0");
  return `PED-${nextNum}`;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function listProducts(tenantId: string) {
  return db.product.findMany({
    where: { tenantId, active: true },
    orderBy: { ref: "asc" },
  });
}

export async function getAllProducts(tenantId: string) {
  return db.product.findMany({
    where: { tenantId },
    orderBy: { ref: "asc" },
  });
}

export async function getProduct(id: string, tenantId: string) {
  return db.product.findFirst({ where: { id, tenantId } });
}

export async function createProduct(data: CreateProductInput, tenantId: string) {
  return db.product.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateProduct(id: string, tenantId: string, data: {
  name?: string; description?: string; salePrice?: number | null;
  category?: string; brand?: string;
}) {
  return db.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.brand !== undefined && { brand: data.brand }),
    },
  });
}

export async function toggleProductActive(id: string, tenantId: string) {
  const p = await db.product.findFirst({ where: { id, tenantId } });
  if (!p) throw new Error("Producto no encontrado");
  return db.product.update({ where: { id }, data: { active: !p.active } });
}

// ============================================================
// SUPPLIERS
// ============================================================

export async function listSuppliers(tenantId: string) {
  return db.supplier.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllSuppliers(tenantId: string) {
  return db.supplier.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function updateSupplier(id: string, tenantId: string, data: {
  name?: string; phone?: string; email?: string; taxId?: string;
  commercialTerms?: string; paymentTerms?: string; notes?: string;
}) {
  return db.supplier.update({ where: { id }, data });
}

export async function toggleSupplierActive(id: string, tenantId: string) {
  const s = await db.supplier.findFirst({ where: { id, tenantId } });
  if (!s) throw new Error("Proveedor no encontrado");
  return db.supplier.update({ where: { id }, data: { active: !s.active } });
}

export async function createSupplier(data: CreateSupplierInput, tenantId: string) {
  return db.supplier.create({
    data: {
      name: data.name,
      code: data.code,
      phone: data.phone || null,
      email: data.email || null,
      tenantId,
    },
  });
}

// ============================================================
// PURCHASE ORDERS
// ============================================================

export async function listPurchaseOrders(tenantId: string) {
  return db.purchaseOrder.findMany({
    where: { tenantId },
    include: {
      supplier: { select: { name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseOrder(id: string, tenantId: string) {
  return db.purchaseOrder.findFirst({
    where: { id, tenantId },
    include: {
      supplier: true,
      createdBy: { select: { name: true } },
      lines: {
        include: {
          product: { select: { ref: true, name: true } },
        },
      },
    },
  });
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderInput,
  tenantId: string,
  createdById: string,
) {
  const orderNumber = await generateOrderNumber(tenantId);

  return db.purchaseOrder.create({
    data: {
      orderNumber,
      type: data.type,
      supplierId: data.supplierId,
      notes: data.notes || null,
      tenantId,
      createdById,
      lines: {
        create: data.lines.map((line) => ({
          productId: line.productId,
          quantityOrdered: line.quantityOrdered,
          expectedUnitCost: line.expectedUnitCost
            ? new Prisma.Decimal(line.expectedUnitCost)
            : null,
        })),
      },
    },
    include: {
      lines: {
        include: {
          product: { select: { ref: true, name: true } },
        },
      },
    },
  });
}

export async function updatePurchaseOrderStatus(
  id: string,
  tenantId: string,
  status: PurchaseStatus,
) {
  return db.purchaseOrder.update({
    where: { id },
    data: { status },
  });
}
