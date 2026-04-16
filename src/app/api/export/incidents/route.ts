import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const incidents = await db.incident.findMany({
    where: { tenantId },
    include: {
      reception: {
        select: {
          receptionNumber: true,
          purchaseOrder: { select: { orderNumber: true } },
        },
      },
      reportedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Incidencias");

  ws.columns = [
    { header: "Tipo", key: "type", width: 22 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Descripcion", key: "description", width: 50 },
    { header: "Recepcion", key: "reception", width: 12 },
    { header: "Pedido", key: "order", width: 12 },
    { header: "Reportado por", key: "reporter", width: 18 },
    { header: "Resolucion", key: "resolution", width: 40 },
    { header: "Fecha", key: "date", width: 16 },
  ];

  // Style header
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  const typeLabels: Record<string, string> = {
    QUANTITY_MISMATCH: "Diferencia cantidad",
    DAMAGED: "Dañado",
    WRONG_PRODUCT: "Producto equivocado",
    OTHER: "Otro",
  };

  const statusLabels: Record<string, string> = {
    REGISTERED: "Registrada",
    NOTIFIED: "Notificada",
    REVIEWED: "Revisada",
    CLOSED: "Cerrada",
  };

  incidents.forEach((inc) => {
    ws.addRow({
      type: typeLabels[inc.type] || inc.type,
      status: statusLabels[inc.status] || inc.status,
      description: inc.description,
      reception: inc.reception.receptionNumber,
      order: inc.reception.purchaseOrder.orderNumber,
      reporter: inc.reportedBy.name,
      resolution: inc.resolution || "",
      date: new Date(inc.createdAt).toLocaleDateString("es-ES"),
    });
  });

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="incidencias-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
