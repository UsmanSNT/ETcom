import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const data: { status?: string; reply?: string; repliedAt?: Date } = {};

  if (typeof body.status === "string") {
    data.status = body.status;
  }

  if (typeof body.reply === "string") {
    data.reply = body.reply.trim();
    data.repliedAt = new Date();
    if (!body.status) {
      data.status = "done";
    }
  }

  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data,
  });

  return NextResponse.json(inquiry);
}
