/**
 * V8: Unified customer resolution from Delivery.
 *
 * DEPRECATION PATH: Delivery.customerName/customerPhone/customerAddress are
 * LEGACY fields kept for backward compatibility. New code MUST use Customer
 * entity via customerId. This helper returns the best available truth.
 */

type DeliveryLike = {
  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerAddress: string;
  customer?: {
    id: string;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    addressLine1: string;
    city?: string | null;
  } | null;
};

export type ResolvedCustomer = {
  id: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string;
  city: string | null;
  source: "customer_entity" | "legacy_inline";
};

export function resolveCustomer(delivery: DeliveryLike): ResolvedCustomer {
  if (delivery.customer) {
    return {
      id: delivery.customer.id,
      fullName: delivery.customer.fullName,
      phone: delivery.customer.phone ?? null,
      email: delivery.customer.email ?? null,
      address: delivery.customer.addressLine1,
      city: delivery.customer.city ?? null,
      source: "customer_entity",
    };
  }

  return {
    id: delivery.customerId ?? null,
    fullName: delivery.customerName,
    phone: delivery.customerPhone ?? null,
    email: null,
    address: delivery.customerAddress,
    city: null,
    source: "legacy_inline",
  };
}
