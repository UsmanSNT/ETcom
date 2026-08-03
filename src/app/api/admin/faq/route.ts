import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.questionKo !== "string" || typeof body.questionEn !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const faq = await prisma.faq.create({
    data: {
      questionKo: body.questionKo,
      questionEn: body.questionEn,
      answerKo: body.answerKo ?? "",
      answerEn: body.answerEn ?? "",
      order: body.order ?? 0,
      isPublished: body.isPublished ?? true,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const faq = await prisma.faq.update({
    where: { id: body.id },
    data: {
      questionKo: body.questionKo,
      questionEn: body.questionEn,
      answerKo: body.answerKo,
      answerEn: body.answerEn,
      order: body.order ?? 0,
      isPublished: body.isPublished ?? true,
    },
  });
  return NextResponse.json(faq);
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.faq.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
