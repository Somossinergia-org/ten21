import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as attachmentService from "@/services/attachment.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const att = await attachmentService.getAttachment(id, session.user.tenantId);
  if (!att) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // dataUrl is like "data:image/png;base64,iVBOR..."
  const commaIdx = att.dataUrl.indexOf(",");
  const base64 = att.dataUrl.substring(commaIdx + 1);
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": att.fileType,
      "Content-Disposition": `inline; filename="${att.fileName}"`,
    },
  });
}
