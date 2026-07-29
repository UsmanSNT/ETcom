import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.status !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(inquiry);
}
