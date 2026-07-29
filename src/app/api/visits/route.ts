import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "/";
  const locale = body?.locale === "en" ? "en" : "ko";

  await prisma.pageVisit.create({ data: { path, locale } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
