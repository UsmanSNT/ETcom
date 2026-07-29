import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const inquiries = await prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(inquiries);
}
