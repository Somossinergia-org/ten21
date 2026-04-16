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
  const orders = await db.purchaseOrder.findMany({
    where: { tenantId },
    include: {
      supplier: { select: { name: true } },
      lines: { include: { product: { select: { ref: true, name: true } } } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pedidos");

  ws.columns = [
    { header: "Pedido", key: "orderNumber", width: 12 },
    { header: "Proveedor", key: "supplier", width: 30 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Producto", key: "product", width: 35 },
    { header: "Ref", key: "ref", width: 10 },
    { header: "Pedido", key: "ordered", width: 10 },
    { header: "Recibido", key: "received", width: 10 },
    { header: "Coste unit.", key: "cost", width: 12 },
    { header: "Creado por", key: "creator", width: 16 },
    { header: "Fecha", key: "date", width: 14 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };

  orders.forEach((order) => {
    order.lines.forEach((line, li) => {
      ws.addRow({
        orderNumber: li === 0 ? order.orderNumber : "",
        supplier: li === 0 ? order.supplier.name : "",
        type: li === 0 ? order.type : "",
        status: li === 0 ? order.status : "",
        product: line.product.name,
        ref: line.product.ref,
        ordered: line.quantityOrdered,
        received: line.quantityReceived,
        cost: line.expectedUnitCost ? Number(line.expectedUnitCost).toFixed(2) : "",
        creator: li === 0 ? order.createdBy.name : "",
        date: li === 0 ? new Date(order.createdAt).toLocaleDateString("es-ES") : "",
      });
    });
  });

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
