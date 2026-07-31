import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const reviews = await prisma.productReview.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid rating" }, { status: 400 });
  }

  const comment = typeof body?.comment === "string" && body.comment.trim() ? body.comment.trim().slice(0, 1000) : null;
  const authorName =
    typeof body?.authorName === "string" && body.authorName.trim() ? body.authorName.trim().slice(0, 60) : null;

  try {
    const review = await prisma.productReview.create({
      data: { productId: product.id, rating, comment, authorName },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products/[id]/reviews] failed to save review:", error);
    return NextResponse.json({ error: "failed to save review" }, { status: 500 });
  }
}
