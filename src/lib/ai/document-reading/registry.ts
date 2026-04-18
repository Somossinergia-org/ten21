export type DocumentReadingProfile = {
  agentCode: string;
  documentType: string;
  fieldsExpected: string[];
  ambiguityRules: string[];
  inconsistencyRules: string[];
  outputTemplate: {
    resumen: string;
    camposDetectados: string;
    huecos: string;
    inconsistencias: string;
    impacto: string;
    accionSugerida: string;
    confianza: string;
  };
};

export const DOCUMENT_READING_PROFILES: DocumentReadingProfile[] = [
  {
    agentCode: "invoices",
    documentType: "SupplierInvoice",
    fieldsExpected: ["invoiceNumber", "supplierName", "supplierNif", "baseAmount", "taxAmount", "totalAmount", "invoiceDate", "dueDate"],
    ambiguityRules: [
      "Si falta NIF del emisor: marcar como huecoN",
      "Si totalAmount != baseAmount + taxAmount: inconsistencia",
      "Si dueDate es anterior a invoiceDate: inconsistencia",
    ],
    inconsistencyRules: [
      "Importes no cuadran: reportar diferencia exacta",
      "Falta NIF o numero de factura: no se puede conciliar formalmente",
    ],
    outputTemplate: {
      resumen: "Factura del proveedor X por Y euros con vencimiento Z",
      camposDetectados: "Lista de campos extraidos",
      huecos: "Campos faltantes o ambiguos",
      inconsistencias: "Discrepancias entre campos",
      impacto: "Tesoreria y conciliacion",
      accionSugerida: "Conciliar con pedido/revisar campos faltantes",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "invoices",
    documentType: "CustomerInvoice",
    fieldsExpected: ["invoiceNumber", "customerId", "total", "dueDate", "status", "paidAmount"],
    ambiguityRules: [
      "Si paidAmount > total: inconsistencia",
      "Si status=PAID pero paidAt null: inconsistencia",
    ],
    inconsistencyRules: [
      "Factura emitida sin cliente: error critico",
      "Total 0: revisar lineas",
    ],
    outputTemplate: {
      resumen: "Factura cliente X por Y euros, estado Z",
      camposDetectados: "Lista",
      huecos: "Campos faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Tesoreria",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "purchases",
    documentType: "PurchaseOrder",
    fieldsExpected: ["orderNumber", "supplierId", "status", "lines", "total esperado"],
    ambiguityRules: [
      "Si SENT hace mas de 14 dias sin recepcion: retraso",
      "Si PARTIAL: calcular % recibido",
    ],
    inconsistencyRules: [
      "Lineas sin productId: catalogo desincronizado",
    ],
    outputTemplate: {
      resumen: "Pedido a proveedor X, estado Y, % recibido Z",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Stock y abastecimiento",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "warehouse",
    documentType: "Reception",
    fieldsExpected: ["receptionNumber", "deliveryNoteRef", "lines", "status", "incidents"],
    ambiguityRules: [
      "quantityReceived < quantityExpected: falta mercancia",
      "quantityDamaged > 0: daño detectado",
    ],
    inconsistencyRules: [
      "Sin deliveryNoteRef: no se puede auditar albaran",
    ],
    outputTemplate: {
      resumen: "Recepcion X del pedido Y con N discrepancias",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Stock y pedido",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "deliveries",
    documentType: "Delivery",
    fieldsExpected: ["deliveryNumber", "customerId", "vehicleId", "status", "scheduledDate", "proofs"],
    ambiguityRules: [
      "Si DELIVERED sin proofs y proofRequired: falta evidencia",
      "Si FAILED sin failedReason: contexto incompleto",
    ],
    inconsistencyRules: [
      "Sin vehicleId y status ASSIGNED: error de asignacion",
    ],
    outputTemplate: {
      resumen: "Entrega X, estado Y, cliente Z",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Cliente y stock",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "sales",
    documentType: "SalesOrder",
    fieldsExpected: ["orderNumber", "customerId", "status", "total", "lines", "estimatedMargin"],
    ambiguityRules: [
      "Si PARTIALLY_RESERVED: revisar stock faltante",
      "Si estimatedMargin negativo: alerta",
    ],
    inconsistencyRules: [
      "Total 0 con lineas: error de calculo",
    ],
    outputTemplate: {
      resumen: "Venta X al cliente Y por Z euros",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Pipeline y entrega",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "inventory",
    documentType: "Product",
    fieldsExpected: ["ref", "name", "stock", "reservado", "disponible", "defaultCost", "salePrice"],
    ambiguityRules: [
      "Sin defaultCost: margen estimado no fiable",
      "disponible < 0: error de calculo",
    ],
    inconsistencyRules: [
      "reservado > onHand: inconsistencia critica",
    ],
    outputTemplate: {
      resumen: "Producto X con stock Y",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Ventas y aprovisionamiento",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
  {
    agentCode: "postsales",
    documentType: "PostSaleTicket",
    fieldsExpected: ["ticketNumber", "customerId", "type", "priority", "status", "description"],
    ambiguityRules: [
      "Si URGENT abierto mas de 24h: alerta",
    ],
    inconsistencyRules: [
      "CLOSED sin resolution: error de cierre",
    ],
    outputTemplate: {
      resumen: "Ticket X del cliente Y, tipo Z",
      camposDetectados: "Lista",
      huecos: "Faltantes",
      inconsistencias: "Discrepancias",
      impacto: "Satisfaccion cliente",
      accionSugerida: "Siguiente paso",
      confianza: "alta/media/baja",
    },
  },
];

export function getDocumentProfile(agentCode: string, documentType: string): DocumentReadingProfile | undefined {
  return DOCUMENT_READING_PROFILES.find((p) => p.agentCode === agentCode && p.documentType === documentType);
}
