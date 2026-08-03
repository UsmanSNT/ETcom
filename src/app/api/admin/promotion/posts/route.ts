import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const posts = await prisma.promotionPost.findMany({
    orderBy: { publishedAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
    },
  });
  return NextResponse.json(posts.map(withImageUrls));
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.categoryId !== "string" || typeof body.titleKo !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const imageIds = getImageIds(body.images);
  if (imageIds === null) {
    return NextResponse.json({ error: "up to 5 images allowed" }, { status: 400 });
  }
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.promotionPost.create({ data: {
      categoryId: body.categoryId,
      titleKo: body.titleKo,
      titleEn: body.titleEn ?? "",
      contentKo: body.contentKo ?? "",
      contentEn: body.contentEn ?? "",
      thumbnailUrl: null,
      isPublished: body.isPublished ?? true,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      slug: cleanText(body.slug),
      canonicalUrl: cleanText(body.canonicalUrl),
      ogTitle: cleanText(body.ogTitle),
      ogDescription: cleanText(body.ogDescription),
      noIndex: Boolean(body.noIndex),
    } });
    await Promise.all(imageIds.map((id, order) =>
      tx.imageAsset.updateMany({
        where: { id, productId: null, promotionPostId: null, businessAreaId: null },
        data: { promotionPostId: created.id, order },
      }),
    ));
    return tx.promotionPost.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(post), { status: 201 });
}

function getImageIds(images: unknown): string[] | null {
  if (!Array.isArray(images) || images.length > 5) return images === undefined ? [] : null;
  const ids = images.map((image) => image && typeof image === "object" && "id" in image ? String(image.id) : "");
  return ids.every(Boolean) && new Set(ids).size === ids.length ? ids : null;
}

function withImageUrls<T extends { images: Array<{ id: string }> }>(item: T) {
  return { ...item, images: item.images.map((image) => ({ ...image, url: `/api/images/${image.id}` })) };
}

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
