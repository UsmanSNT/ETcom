import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const posts = await prisma.promotionPost.findMany({
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.categoryId !== "string" || typeof body.titleKo !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const post = await prisma.promotionPost.create({
    data: {
      categoryId: body.categoryId,
      titleKo: body.titleKo,
      titleEn: body.titleEn ?? "",
      contentKo: body.contentKo ?? "",
      contentEn: body.contentEn ?? "",
      thumbnailUrl: body.thumbnailUrl ?? null,
      isPublished: body.isPublished ?? true,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
