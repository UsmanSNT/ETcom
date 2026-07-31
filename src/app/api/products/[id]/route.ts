import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!product || !product.isPublished) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { reviews, ...rest } = product;
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;

  return NextResponse.json({
    ...rest,
    images: rest.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
    avgRating,
    reviewCount,
  });
}
