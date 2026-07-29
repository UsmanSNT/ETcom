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

  const product = await prisma.product.update({
    where: { id },
    data: {
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      descriptionKo: body.descriptionKo,
      descriptionEn: body.descriptionEn,
      thumbnailUrl: body.thumbnailUrl ?? null,
      isPublished: body.isPublished,
      order: body.order,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
