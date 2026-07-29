import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.promotionPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(posts);
}
