import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.promotionPost.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      images: { orderBy: { order: "asc" }, select: { id: true } },
    },
  });
  if (!post || !post.isPublished) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...post,
    images: post.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
  });
}
