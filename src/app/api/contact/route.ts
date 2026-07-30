import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.message !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { name, email, phone, message, type } = body;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  const inquiry = await prisma.contactInquiry.create({
    data: {
      type: type === "product" ? "product" : "general",
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : null,
      message: message.trim(),
    },
  });

  return NextResponse.json({ id: inquiry.id }, { status: 201 });
}
