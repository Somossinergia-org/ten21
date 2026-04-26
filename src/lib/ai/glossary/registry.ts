export type GlossaryTerm = {
  domain: string;
  term: string;
  shortDefinition: string;
  longDefinition?: string;
  synonyms?: string[];
  businessLanguage?: string;
  relatedEntities?: string[];
};

export const GLOSSARY: GlossaryTerm[] = [
  // Productos
  { domain: "productos", term: "referencia", shortDefinition: "Codigo unico del producto en el catalogo", synonyms: ["ref", "SKU", "codigo"], businessLanguage: "referencia del producto" },
  { domain: "productos", term: "coste esperado", shortDefinition: "Coste unitario previsto al pedir al proveedor", synonyms: ["precio de compra previsto"], relatedEntities: ["PurchaseOrderLine"] },
  { domain: "productos", term: "stock disponible", shortDefinition: "Unidades en almacen no reservadas", synonyms: ["disponible", "libre"], relatedEntities: ["ProductInventory"] },
  { domain: "productos", term: "stock reservado", shortDefinition: "Unidades comprometidas por ventas confirmadas", synonyms: ["reservado"], relatedEntities: ["SalesOrder"] },

  // Compras
  { domain: "compras", term: "pedido parcial", shortDefinition: "Pedido donde algunas lineas no se han recibido completas", longDefinition: "Estado PARTIAL de PurchaseOrder. Algunas lineas tienen quantityReceived < quantityOrdered", synonyms: ["recibido parcial"], relatedEntities: ["PurchaseOrder"] },
  { domain: "compras", term: "albaran", shortDefinition: "Documento de entrega del proveedor", synonyms: ["nota de entrega"], relatedEntities: ["Reception"] },
  { domain: "compras", term: "discrepancia", shortDefinition: "Diferencia entre lo esperado y lo recibido", longDefinition: "Genera incidencia automatica tipo QUANTITY_MISMATCH o DAMAGED", relatedEntities: ["Incident"] },
  { domain: "compras", term: "fiabilidad proveedor", shortDefinition: "Porcentaje de recepciones sin incidencias de un proveedor", businessLanguage: "cumplimiento del proveedor" },

  // Ventas
  { domain: "ventas", term: "reserva", shortDefinition: "Bloqueo de stock para una venta confirmada", longDefinition: "SALE_RESERVE en StockMovement. Decrementa available, incrementa reserved", relatedEntities: ["SalesOrder"] },
  { domain: "ventas", term: "venta atascada", shortDefinition: "Venta confirmada sin progreso a entrega", businessLanguage: "venta sin servir" },
  { domain: "ventas", term: "margen estimado", shortDefinition: "Precio de venta menos coste esperado", longDefinition: "Calculado al crear la venta con unitSalePrice - unitExpectedCost", relatedEntities: ["SalesOrderLine"] },
  { domain: "ventas", term: "margen real", shortDefinition: "Margen calculado con coste de recepcion real", longDefinition: "Solo disponible si recepcion completada y coste real conocido" },

  // Documentos
  { domain: "documentos", term: "factura proveedor", shortDefinition: "Factura emitida por proveedor al negocio", relatedEntities: ["SupplierInvoice"] },
  { domain: "documentos", term: "factura cliente", shortDefinition: "Factura emitida por el negocio al cliente", relatedEntities: ["CustomerInvoice"] },
  { domain: "documentos", term: "conciliacion", shortDefinition: "Vincular factura con pedido para comparar importes" },
  { domain: "documentos", term: "prueba de entrega", shortDefinition: "Evidencia (foto/firma/GPS) de que un pedido fue entregado", relatedEntities: ["DeliveryProof"] },

  // Finanzas
  { domain: "finanzas", term: "caja 7 dias", shortDefinition: "Balance previsto de ingresos menos gastos a 7 dias", businessLanguage: "dinero disponible a corto plazo" },
  { domain: "finanzas", term: "vencido", shortDefinition: "Pago o cobro con dueDate anterior a hoy y no pagado" },
  { domain: "finanzas", term: "base imponible", shortDefinition: "Importe antes de aplicar IVA" },
  { domain: "finanzas", term: "IVA 21", shortDefinition: "Impuesto sobre el valor añadido estandar en España" },

  // SaaS
  { domain: "saas", term: "trial", shortDefinition: "Periodo de prueba gratuita antes de cobrar" },
  { domain: "saas", term: "past_due", shortDefinition: "Tenant con pago fallido pendiente de regularizar", businessLanguage: "impago reciente" },
  { domain: "saas", term: "restricted mode", shortDefinition: "Estado que limita operacion por impago o expiracion", longDefinition: "Mantiene acceso a billing y export pero bloquea creacion masiva" },
  { domain: "saas", term: "churn", shortDefinition: "Perdida del cliente por cancelacion o no renovacion" },

  // Seguridad
  { domain: "seguridad", term: "MFA", shortDefinition: "Autenticacion de 2 factores (TOTP)", synonyms: ["2FA", "autenticacion de 2 pasos"] },
  { domain: "seguridad", term: "lockout", shortDefinition: "Bloqueo temporal tras 5 fallos de login", longDefinition: "15 minutos de bloqueo automatico" },
  { domain: "seguridad", term: "rate limit", shortDefinition: "Limite de peticiones por periodo para prevenir abuso" },

  // Posventa
  { domain: "posventa", term: "ticket urgente", shortDefinition: "Ticket con priority=HIGH o URGENT abierto" },
  { domain: "posventa", term: "cliente reincidente", shortDefinition: "Cliente con mas de 2 tickets en un periodo", businessLanguage: "cliente con problemas repetidos" },

  // Entregas
  { domain: "entregas", term: "saturacion ruta", shortDefinition: "Demasiadas entregas asignadas a un vehiculo" },
  { domain: "entregas", term: "ventana horaria", shortDefinition: "Horario acordado con el cliente para recibir" },
];

export function getTerms(domain: string): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.domain === domain);
}

export function findTerm(term: string): GlossaryTerm | undefined {
  const lower = term.toLowerCase();
  return GLOSSARY.find((t) =>
    t.term.toLowerCase() === lower ||
    t.synonyms?.some((s) => s.toLowerCase() === lower),
  );
}
