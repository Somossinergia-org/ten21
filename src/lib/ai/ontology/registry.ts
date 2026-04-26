export type OntologyRelation = {
  sourceType: string;
  relationType: string;
  targetType: string;
  description: string;
};

export const ONTOLOGY: OntologyRelation[] = [
  // Compras -> Almacen -> Inventario
  { sourceType: "PurchaseOrder", relationType: "genera", targetType: "Reception", description: "Un pedido a proveedor genera una o varias recepciones" },
  { sourceType: "Reception", relationType: "puede_generar", targetType: "Incident", description: "Una recepcion con discrepancias genera incidencias automaticas" },
  { sourceType: "Reception", relationType: "incrementa", targetType: "ProductInventory", description: "Recepcion completada incrementa stock disponible (RECEPTION_IN)" },

  // Ventas -> Entregas
  { sourceType: "SalesOrder", relationType: "reserva", targetType: "ProductInventory", description: "Venta confirmada reserva stock (SALE_RESERVE)" },
  { sourceType: "SalesOrder", relationType: "genera", targetType: "Delivery", description: "Venta RESERVED genera una entrega" },
  { sourceType: "SalesOrder", relationType: "puede_generar", targetType: "CustomerInvoice", description: "Venta puede facturarse al cliente" },
  { sourceType: "Delivery", relationType: "decrementa", targetType: "ProductInventory", description: "Entrega DELIVERED descuenta stock (DELIVERY_OUT)" },
  { sourceType: "Delivery", relationType: "captura", targetType: "DeliveryProof", description: "Entrega puede capturar foto/firma/GPS como prueba" },
  { sourceType: "Delivery", relationType: "puede_generar", targetType: "PostSaleTicket", description: "Entrega fallida puede derivar a ticket postventa" },

  // Finanzas
  { sourceType: "SupplierInvoice", relationType: "vinculada_a", targetType: "PurchaseOrder", description: "Factura proveedor se vincula a pedido para conciliar" },
  { sourceType: "SupplierInvoice", relationType: "genera", targetType: "TreasuryEntry", description: "Factura proveedor emitida genera gasto esperado en tesoreria" },
  { sourceType: "CustomerInvoice", relationType: "genera", targetType: "TreasuryEntry", description: "Factura cliente emitida genera ingreso esperado" },
  { sourceType: "CustomerInvoice", relationType: "vinculada_a", targetType: "SalesOrder", description: "Factura cliente se genera desde una venta" },

  // SaaS y Compliance
  { sourceType: "Tenant", relationType: "tiene", targetType: "TenantSubscription", description: "Cada tenant tiene una suscripcion activa" },
  { sourceType: "TenantSubscription", relationType: "aplica", targetType: "SubscriptionPlan", description: "La suscripcion define plan, precio, limites y features" },
  { sourceType: "Tenant", relationType: "entra_en", targetType: "RestrictedMode", description: "Tenant PAST_DUE o EXPIRED entra en modo restringido" },
  { sourceType: "Customer", relationType: "puede_solicitar", targetType: "DataDeletionRequest", description: "Cliente puede pedir borrado/anonimizacion RGPD" },

  // Seguridad
  { sourceType: "User", relationType: "puede_tener", targetType: "UserMfa", description: "Usuario puede activar MFA TOTP" },
  { sourceType: "User", relationType: "genera", targetType: "SecurityEvent", description: "Acciones de login/MFA/admin generan eventos de seguridad" },
  { sourceType: "User", relationType: "puede_entrar_en", targetType: "Lockout", description: "5 fallos de login bloquean 15 minutos" },

  // Posventa
  { sourceType: "PostSaleTicket", relationType: "vinculado_a", targetType: "Customer", description: "Cada ticket se liga a un cliente" },
  { sourceType: "PostSaleTicket", relationType: "opcionalmente_a", targetType: "Delivery", description: "Ticket puede referenciar la entrega origen" },
  { sourceType: "PostSaleTicket", relationType: "opcionalmente_a", targetType: "SalesOrder", description: "Ticket puede referenciar la venta origen" },
];

export function getRelations(sourceType: string): OntologyRelation[] {
  return ONTOLOGY.filter((r) => r.sourceType === sourceType);
}

export function getInverseRelations(targetType: string): OntologyRelation[] {
  return ONTOLOGY.filter((r) => r.targetType === targetType);
}
