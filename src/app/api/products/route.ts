import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bayesian ("weighted") average — the same technique IMDB uses for its
// popularity ranking. Products with few reviews are pulled toward the
// site-wide average rating so a single 5-star vote can't outrank a product
// with dozens of consistently high ratings.
const MIN_VOTES = 3;

export const revalidate = 60;

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true } },
      reviews: { select: { rating: true } },
    },
  });

  const allRatings = products.flatMap((p) => p.reviews.map((r) => r.rating));
  const globalMean = allRatings.length ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;

  const withStats = products.map((product) => {
    const { reviews, ...rest } = product;
    const reviewCount = reviews.length;
    const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    const popularityScore =
      reviewCount === 0
        ? 0
        : (reviewCount / (reviewCount + MIN_VOTES)) * (avgRating as number) +
          (MIN_VOTES / (reviewCount + MIN_VOTES)) * globalMean;

    return {
      ...rest,
      images: rest.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
      avgRating,
      reviewCount,
      popularityScore,
    };
  });

  return NextResponse.json(withStats);
}
