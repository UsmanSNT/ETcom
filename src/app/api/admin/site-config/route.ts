import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const configs = await prisma.siteConfig.findMany();
    const result: Record<string, string> = {};
    for (const c of configs) result[c.key] = c.value;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { key, value } = body as { key: string; value: string };
  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }
  try {
    await prisma.siteConfig.upsert({
      where: { key },
      create: { key, value: value ?? "" },
      update: { value: value ?? "" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "SiteConfig table not available. Run prisma db push." }, { status: 500 });
  }
}
