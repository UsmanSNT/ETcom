import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.promotionPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { order: "asc" }, select: { id: true } },
    },
  });
  return NextResponse.json(posts.map((post) => ({
    ...post,
    images: post.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
  })));
}
