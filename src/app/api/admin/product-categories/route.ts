import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { nameKo, nameEn, order } = body;
  if (!nameKo || !nameEn) {
    return NextResponse.json({ error: "nameKo and nameEn required" }, { status: 400 });
  }
  const category = await prisma.productCategory.create({
    data: { nameKo, nameEn, order: order ?? 0 },
  });
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, nameKo, nameEn, order } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const category = await prisma.productCategory.update({
    where: { id },
    data: {
      ...(nameKo !== undefined && { nameKo }),
      ...(nameEn !== undefined && { nameEn }),
      ...(order !== undefined && { order }),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.productCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
