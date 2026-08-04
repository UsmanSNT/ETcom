import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        questionKo: true,
        questionEn: true,
        answerKo: true,
        answerEn: true,
      },
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json([]);
  }
}
