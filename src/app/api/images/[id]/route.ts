import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await prisma.imageAsset.findUnique({
    where: { id },
    select: { data: true, mimeType: true, fileName: true },
  });

  if (!image) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(image.fileName)}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
