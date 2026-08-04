import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.promotionPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        titleKo: true,
        titleEn: true,
        contentKo: true,
        contentEn: true,
        thumbnailUrl: true,
        publishedAt: true,
        category: { select: { id: true, slug: true, nameKo: true, nameEn: true } },
        images: { orderBy: { order: "asc" }, select: { id: true }, take: 1 },
      },
    });
    return NextResponse.json(posts.map((post) => ({
      ...post,
      images: post.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
    })));
  } catch {
    return NextResponse.json([]);
  }
}
