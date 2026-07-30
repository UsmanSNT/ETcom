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
  const imageIds = getImageIds(body.images);
  if (imageIds === null) {
    return NextResponse.json({ error: "up to 5 images allowed" }, { status: 400 });
  }

  const post = await prisma.$transaction(async (tx) => {
    await tx.promotionPost.update({
    where: { id },
    data: {
      categoryId: body.categoryId,
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      contentKo: body.contentKo,
      contentEn: body.contentEn,
      thumbnailUrl: null,
      isPublished: body.isPublished,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      slug: cleanText(body.slug),
      canonicalUrl: cleanText(body.canonicalUrl),
      ogTitle: cleanText(body.ogTitle),
      ogDescription: cleanText(body.ogDescription),
      noIndex: Boolean(body.noIndex),
    } });
    await tx.imageAsset.deleteMany({
      where: { promotionPostId: id, ...(imageIds.length ? { id: { notIn: imageIds } } : {}) },
    });
    await Promise.all(imageIds.map((imageId, order) =>
      tx.imageAsset.updateMany({
        where: {
          id: imageId,
          OR: [{ promotionPostId: id }, { productId: null, promotionPostId: null }],
        },
        data: { promotionPostId: id, productId: null, order },
      }),
    ));
    return tx.promotionPost.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json({ ...post, images: post.images.map((image) => ({ ...image, url: `/api/images/${image.id}` })) });
}

function getImageIds(images: unknown): string[] | null {
  if (!Array.isArray(images) || images.length > 5) return images === undefined ? [] : null;
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
  await prisma.promotionPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
