import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameKo: true, nameEn: true },
  });
  return NextResponse.json(categories);
}
