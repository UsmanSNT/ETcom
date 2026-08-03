import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const industries = await prisma.keyIndustry.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        images: {
          orderBy: { order: "asc" },
          select: { id: true },
          take: 1,
        },
      },
    });
    return NextResponse.json(
      industries.map((i) => ({
        id: i.id,
        titleKo: i.titleKo,
        titleEn: i.titleEn,
        imageUrl: i.images[0] ? `/api/images/${i.images[0].id}` : null,
      })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
