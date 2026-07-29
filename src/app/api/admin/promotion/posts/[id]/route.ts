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

  const post = await prisma.promotionPost.update({
    where: { id },
    data: {
      categoryId: body.categoryId,
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      contentKo: body.contentKo,
      contentEn: body.contentEn,
      thumbnailUrl: body.thumbnailUrl ?? null,
      isPublished: body.isPublished,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.promotionPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
