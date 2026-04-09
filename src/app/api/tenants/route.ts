import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tenants = await db.tenant.findMany({
    where: { active: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tenants);
}
