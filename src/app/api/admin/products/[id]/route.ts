import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
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
    await tx.product.update({
    where: { id },
    data: {
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      descriptionKo: body.descriptionKo,
      descriptionEn: body.descriptionEn,
      thumbnailUrl: null,
      categoryKo: body.categoryKo ?? null,
      categoryEn: body.categoryEn ?? null,
      categoryId: body.categoryId || null,
      price: body.price ? Number(body.price) : null,
      purchaseUrl: cleanText(body.purchaseUrl),
      isPublished: body.isPublished,
      order: body.order,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      slug: cleanText(body.slug),
      canonicalUrl: cleanText(body.canonicalUrl),
      ogTitle: cleanText(body.ogTitle),
      ogDescription: cleanText(body.ogDescription),
      noIndex: Boolean(body.noIndex),
    } });
    await tx.imageAsset.deleteMany({
      where: { productId: id, ...(imageIds.length ? { id: { notIn: imageIds } } : {}) },
    });
    await Promise.all(imageIds.map((imageId, order) =>
      tx.imageAsset.updateMany({
        where: {
          id: imageId,
          OR: [{ productId: id }, { productId: null, detailProductId: null, promotionPostId: null, businessAreaId: null }],
        },
        data: { productId: id, promotionPostId: null, detailProductId: null, order },
      }),
    ));
    await tx.imageAsset.deleteMany({
      where: { detailProductId: id, ...(detailImageIds.length ? { id: { notIn: detailImageIds } } : {}) },
    });
    await Promise.all(detailImageIds.map((imageId, order) =>
      tx.imageAsset.updateMany({
        where: {
          id: imageId,
          OR: [{ detailProductId: id }, { productId: null, detailProductId: null, promotionPostId: null, businessAreaId: null }],
        },
        data: { detailProductId: id, productId: null, promotionPostId: null, order },
      }),
    ));
    return tx.product.findUniqueOrThrow({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
        detailImages: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  const addUrl = (img: { id: string }) => ({ ...img, url: `/api/images/${img.id}` });
  return NextResponse.json({
    ...product,
    images: product.images.map(addUrl),
    detailImages: product.detailImages.map(addUrl),
  });
}

function getImageIds(images: unknown, max: number): string[] | null {
  if (!Array.isArray(images) || images.length > max) return images === undefined ? [] : null;
  const ids = images.map((image) => image && typeof image === "object" && "id" in image ? String(image.id) : "");
  return ids.every(Boolean) && new Set(ids).size === ids.length ? ids : null;
}

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
