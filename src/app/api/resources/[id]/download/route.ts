import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await prisma.downloadResource.findFirst({
    where: { id, isPublished: true },
  });
  if (!resource) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(resource.data), {
    headers: {
      "Content-Type": resource.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(resource.fileName)}`,
      "Content-Length": String(resource.size),
    },
  });
}
