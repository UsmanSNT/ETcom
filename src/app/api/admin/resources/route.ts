import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const resources = await prisma.downloadResource.findMany({
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    select: { id: true, slot: true, titleKo: true, titleEn: true, fileName: true, mimeType: true, size: true, publishedAt: true, isPublished: true, order: true },
  });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const titleKo = String(form?.get("titleKo") ?? "").trim();
  const titleEn = String(form?.get("titleEn") ?? "").trim();
  const slot = String(form?.get("slot") ?? "").trim();
  if (!(file instanceof File) || !titleKo || !slot) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "file too large" }, { status: 400 });

  const fileData = {
      titleKo,
      titleEn,
      fileName: file.name.slice(0, 255),
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data: Buffer.from(await file.arrayBuffer()),
      publishedAt: new Date(String(form?.get("publishedAt") || new Date().toISOString())),
      isPublished: String(form?.get("isPublished")) !== "false",
      order: Number(form?.get("order") ?? 0) || 0,
  };
  const resource = await prisma.downloadResource.upsert({
    where: { slot },
    update: fileData,
    create: { slot, ...fileData },
    select: { id: true, slot: true, titleKo: true, titleEn: true, fileName: true, mimeType: true, size: true, publishedAt: true, isPublished: true, order: true },
  });
  return NextResponse.json(resource, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.downloadResource.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
