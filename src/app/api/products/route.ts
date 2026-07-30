import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: { images: { orderBy: { order: "asc" }, select: { id: true } } },
  });
  return NextResponse.json(products.map((product) => ({
    ...product,
    images: product.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
  })));
}
