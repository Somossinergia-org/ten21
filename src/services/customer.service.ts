import { db } from "@/lib/db";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/validations/customer";

export async function listCustomers(tenantId: string) {
  return db.customer.findMany({
    where: { tenantId, active: true },
    orderBy: { fullName: "asc" },
    include: {
      _count: { select: { deliveries: true } },
    },
  });
}

export async function searchCustomers(tenantId: string, query: string) {
  return db.customer.findMany({
    where: {
      tenantId,
      active: true,
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { addressLine1: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { fullName: "asc" },
    take: 20,
  });
}

export async function getCustomer(id: string, tenantId: string) {
  return db.customer.findFirst({
    where: { id, tenantId },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          vehicle: { select: { name: true, plate: true } },
          assignedTo: { select: { name: true } },
        },
      },
    },
  });
}

export async function createCustomer(data: CreateCustomerInput, tenantId: string) {
  return db.customer.create({
    data: { ...data, tenantId },
  });
}

export async function updateCustomer(data: UpdateCustomerInput, tenantId: string) {
  const { id, ...rest } = data;
  return db.customer.update({
    where: { id },
    data: rest,
  });
}

export async function toggleCustomerActive(id: string, tenantId: string) {
  const customer = await db.customer.findFirst({ where: { id, tenantId } });
  if (!customer) throw new Error("Cliente no encontrado");
  return db.customer.update({
    where: { id },
    data: { active: !customer.active },
  });
}

export async function getAllCustomers(tenantId: string) {
  return db.customer.findMany({
    where: { tenantId },
    orderBy: { fullName: "asc" },
    include: {
      _count: { select: { deliveries: true } },
    },
  });
}
