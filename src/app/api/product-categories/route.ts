import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      select: {
        id: true,
        nameKo: true,
        nameEn: true,
        children: {
          orderBy: { order: "asc" },
          select: { id: true, nameKo: true, nameEn: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
