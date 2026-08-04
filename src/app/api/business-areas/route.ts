import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const areas = await prisma.businessArea.findMany({
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
      areas.map((a) => ({
        id: a.id,
        titleKo: a.titleKo,
        titleEn: a.titleEn,
        itemsKo: a.itemsKo,
        itemsEn: a.itemsEn,
        icon: a.icon,
        imageUrl: a.images[0] ? `/api/images/${a.images[0].id}` : null,
      })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
