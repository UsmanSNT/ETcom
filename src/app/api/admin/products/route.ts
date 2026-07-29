import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.titleKo !== "string" || typeof body.titleEn !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      titleKo: body.titleKo,
      titleEn: body.titleEn,
      descriptionKo: body.descriptionKo ?? "",
      descriptionEn: body.descriptionEn ?? "",
      thumbnailUrl: body.thumbnailUrl ?? null,
      isPublished: body.isPublished ?? true,
      order: body.order ?? 0,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
