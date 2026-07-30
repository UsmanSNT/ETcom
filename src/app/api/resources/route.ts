import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const resources = await prisma.downloadResource.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      slot: true,
      titleKo: true,
      titleEn: true,
      fileName: true,
      mimeType: true,
      size: true,
      publishedAt: true,
    },
  });
  return NextResponse.json(
    resources.map((resource) => ({
      ...resource,
      downloadUrl: `/api/resources/${resource.id}/download`,
    })),
  );
}
