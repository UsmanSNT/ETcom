import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const areas = await prisma.businessArea.findMany({
    orderBy: { order: "asc" },
    include: {
      images: {
        orderBy: { order: "asc" },
        select: { id: true, fileName: true, mimeType: true, size: true, order: true },
      },
    },
  });
  return NextResponse.json(areas.map(withImageUrls));
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.titleKo !== "string" || typeof body.titleEn !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const imageIds = getImageIds(body.images);
  if (imageIds === null) {
    return NextResponse.json({ error: "up to 5 images allowed" }, { status: 400 });
  }

  const area = await prisma.$transaction(async (tx) => {
    const created = await tx.businessArea.create({
      data: {
        titleKo: body.titleKo,
        titleEn: body.titleEn,
        itemsKo: Array.isArray(body.itemsKo) ? body.itemsKo : [],
        itemsEn: Array.isArray(body.itemsEn) ? body.itemsEn : [],
        icon: body.icon || "leaf",
        order: body.order ?? 0,
        isPublished: body.isPublished ?? true,
      },
    });
    await Promise.all(
      imageIds.map((id, order) =>
        tx.imageAsset.updateMany({
          where: { id, productId: null, promotionPostId: null, businessAreaId: null },
          data: { businessAreaId: created.id, order },
        }),
      ),
    );
    return tx.businessArea.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(area), { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const imageIds = getImageIds(body.images);
  if (imageIds === null) {
    return NextResponse.json({ error: "up to 5 images allowed" }, { status: 400 });
  }

  const area = await prisma.$transaction(async (tx) => {
    await tx.businessArea.update({
      where: { id: body.id },
      data: {
        titleKo: body.titleKo,
        titleEn: body.titleEn,
        itemsKo: Array.isArray(body.itemsKo) ? body.itemsKo : [],
        itemsEn: Array.isArray(body.itemsEn) ? body.itemsEn : [],
        icon: body.icon || "leaf",
        order: body.order ?? 0,
        isPublished: body.isPublished ?? true,
      },
    });
    await tx.imageAsset.deleteMany({
      where: { businessAreaId: body.id, ...(imageIds.length ? { id: { notIn: imageIds } } : {}) },
    });
    await Promise.all(
      imageIds.map((imageId, order) =>
        tx.imageAsset.updateMany({
          where: {
            id: imageId,
            OR: [{ businessAreaId: body.id }, { productId: null, promotionPostId: null, businessAreaId: null }],
          },
          data: { businessAreaId: body.id, order },
        }),
      ),
    );
    return tx.businessArea.findUniqueOrThrow({
      where: { id: body.id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(area));
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.businessArea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

function getImageIds(images: unknown): string[] | null {
  if (!Array.isArray(images) || images.length > 5) return images === undefined ? [] : null;
  const ids = images.map((image) => image && typeof image === "object" && "id" in image ? String(image.id) : "");
  return ids.every(Boolean) && new Set(ids).size === ids.length ? ids : null;
}

function withImageUrls<T extends { images: Array<{ id: string }> }>(item: T) {
  return { ...item, images: item.images.map((image) => ({ ...image, url: `/api/images/${image.id}` })) };
}
