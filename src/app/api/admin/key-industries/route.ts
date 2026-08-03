import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const industries = await prisma.keyIndustry.findMany({
    orderBy: { order: "asc" },
    include: {
      images: {
        orderBy: { order: "asc" },
        select: { id: true, fileName: true, mimeType: true, size: true, order: true },
      },
    },
  });
  return NextResponse.json(industries.map(withImageUrls));
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

  const industry = await prisma.$transaction(async (tx) => {
    const created = await tx.keyIndustry.create({
      data: {
        titleKo: body.titleKo,
        titleEn: body.titleEn,
        order: body.order ?? 0,
        isPublished: body.isPublished ?? true,
      },
    });
    await Promise.all(
      imageIds.map((id, order) =>
        tx.imageAsset.updateMany({
          where: { id, productId: null, promotionPostId: null, businessAreaId: null, keyIndustryId: null },
          data: { keyIndustryId: created.id, order },
        }),
      ),
    );
    return tx.keyIndustry.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(industry), { status: 201 });
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

  const industry = await prisma.$transaction(async (tx) => {
    await tx.keyIndustry.update({
      where: { id: body.id },
      data: {
        titleKo: body.titleKo,
        titleEn: body.titleEn,
        order: body.order ?? 0,
        isPublished: body.isPublished ?? true,
      },
    });
    await tx.imageAsset.deleteMany({
      where: { keyIndustryId: body.id, ...(imageIds.length ? { id: { notIn: imageIds } } : {}) },
    });
    await Promise.all(
      imageIds.map((imageId, order) =>
        tx.imageAsset.updateMany({
          where: {
            id: imageId,
            OR: [{ keyIndustryId: body.id }, { productId: null, promotionPostId: null, businessAreaId: null, keyIndustryId: null }],
          },
          data: { keyIndustryId: body.id, order },
        }),
      ),
    );
    return tx.keyIndustry.findUniqueOrThrow({
      where: { id: body.id },
      include: {
        images: { orderBy: { order: "asc" }, select: { id: true, fileName: true, mimeType: true, size: true, order: true } },
      },
    });
  });

  return NextResponse.json(withImageUrls(industry));
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.keyIndustry.delete({ where: { id } });
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
