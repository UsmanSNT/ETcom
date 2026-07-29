import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalVisits, visits7d, newInquiries, totalProducts, totalPosts] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.pageVisit.count({ where: { createdAt: { gte: since7d } } }),
    prisma.contactInquiry.count({ where: { status: "new" } }),
    prisma.product.count(),
    prisma.promotionPost.count(),
  ]);

  const recentInquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalVisits,
    visits7d,
    newInquiries,
    totalProducts,
    totalPosts,
    recentInquiries,
  });
}
