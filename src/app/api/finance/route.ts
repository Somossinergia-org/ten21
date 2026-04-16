import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as financeService from "@/services/finance.service";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const tenantId = session.user.tenantId;

  if (action === "invoices") {
    const invoices = await financeService.listInvoices(tenantId);
    return NextResponse.json({ invoices });
  }

  if (action === "iva") {
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const quarter = parseInt(searchParams.get("quarter") || String(Math.floor(new Date().getMonth() / 3) + 1));
    const summary = await financeService.getIvaSummary(tenantId, year, quarter);
    return NextResponse.json(summary);
  }

  if (action === "alerts") {
    const alerts = await financeService.getInvoiceAlerts(tenantId);
    return NextResponse.json({ alerts });
  }

  if (action === "summary") {
    const summary = await financeService.getExpenseSummary(tenantId);
    return NextResponse.json(summary);
  }

  return NextResponse.json({ error: "action requerida: invoices|iva|alerts|summary" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  if (body.action === "create-from-extraction") {
    const invoice = await financeService.createInvoiceFromExtraction(session.user.tenantId, {
      ...body.data,
      createdById: session.user.id,
    });
    return NextResponse.json({ success: true, invoice });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
