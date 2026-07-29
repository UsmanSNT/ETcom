import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.promotionCategory.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.slug !== "string" || typeof body.nameKo !== "string" || typeof body.nameEn !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const category = await prisma.promotionCategory.create({
    data: {
      slug: body.slug,
      nameKo: body.nameKo,
      nameEn: body.nameEn,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
