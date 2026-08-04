import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: {
      images: {
        orderBy: { order: "asc" },
        select: { id: true, fileName: true, mimeType: true, size: true, order: true },
      },
      detailImages: {
        orderBy: { order: "asc" },
        select: { id: true, fileName: true, mimeType: true, size: true, order: true },
      },
    },
  });
  return NextResponse.json(products.map(withImageUrls));
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.titleKo !== "string" || typeof body.titleEn !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const imageIds = getImageIds(body.images, 5);
  if (imageIds === null) {
    return NextResponse.json({ error: "up to 5 images allowed" }, { status: 400 });
  }
  const detailImageIds = getImageIds(body.detailImages, 30);
  if (detailImageIds === null) {
    return NextResponse.json({ error: "up to 30 detail images allowed" }, { status: 400 });
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: {
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      descriptionKo: body.descriptionKo ?? "",
      descriptionEn: body.descriptionEn ?? "",
      thumbnailUrl: null,
      categoryKo: body.categoryKo ?? null,
      categoryEn: body.categoryEn ?? null,
      categoryId: body.categoryId || null,
      price: body.price ? Number(body.price) : null,
      purchaseUrl: cleanText(body.purchaseUrl),
      isPublished: body.isPublished ?? true,
      order: body.order ?? 0,
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
        where: { id, productId: null, detailProductId: null, promotionPostId: null, businessAreaId: null },
        data: { productId: created.id, order },
      }),
    ));
    await Promise.all(detailImageIds.map((id, order) =>
      tx.imageAsset.updateMany({
        where: { id, productId: null, detailProductId: null, promotionPostId: null, businessAreaId: null },
        data: { detailProductId: created.id, order },
      }),
    ));
    return tx.product.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
        detailImages: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(product), { status: 201 });
}

function getImageIds(images: unknown, max: number): string[] | null {
  if (!Array.isArray(images) || images.length > max) return images === undefined ? [] : null;
  const ids = images.map((image) => image && typeof image === "object" && "id" in image ? String(image.id) : "");
  return ids.every(Boolean) && new Set(ids).size === ids.length ? ids : null;
}

function withImageUrls<T extends { images: Array<{ id: string }>; detailImages: Array<{ id: string }> }>(item: T) {
  return {
    ...item,
    images: item.images.map((image) => ({ ...image, url: `/api/images/${image.id}` })),
    detailImages: item.detailImages.map((image) => ({ ...image, url: `/api/images/${image.id}` })),
  };
}

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
