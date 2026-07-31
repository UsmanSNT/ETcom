import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeImageHash, hashDistance } from "@/lib/imageHash";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// dHash is 64 bits; anything closer than this is considered "visually similar".
const MAX_DISTANCE = 20;

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "file too large" }, { status: 400 });
  }

  const queryHash = await computeImageHash(Buffer.from(await file.arrayBuffer()));
  if (!queryHash) {
    return NextResponse.json({ error: "could not process image" }, { status: 400 });
  }

  const images = await prisma.imageAsset.findMany({
    where: { productId: { not: null }, imageHash: { not: null } },
    select: { productId: true, imageHash: true },
  });

  const bestDistanceByProduct = new Map<string, number>();
  for (const image of images) {
    if (!image.productId || !image.imageHash) continue;
    const distance = hashDistance(queryHash, image.imageHash);
    const current = bestDistanceByProduct.get(image.productId);
    if (current === undefined || distance < current) {
      bestDistanceByProduct.set(image.productId, distance);
    }
  }

  const matchedIds = Array.from(bestDistanceByProduct.entries())
    .filter(([, distance]) => distance <= MAX_DISTANCE)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 20)
    .map(([productId]) => productId);

  if (matchedIds.length === 0) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: matchedIds }, isPublished: true },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true } },
      reviews: { select: { rating: true } },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const ordered = matchedIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const results = ordered.map((product) => {
    const { reviews, ...rest } = product;
    const reviewCount = reviews.length;
    const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    return {
      ...rest,
      images: rest.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
      avgRating,
      reviewCount,
      similarity: Math.round((1 - bestDistanceByProduct.get(product.id)! / 64) * 100),
    };
  });

  return NextResponse.json(results);
}
