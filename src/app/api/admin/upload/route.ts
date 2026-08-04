import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { computeImageHash } from "@/lib/imageHash";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 30;

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const files = formData?.getAll("files").filter((item): item is File => item instanceof File) ?? [];

  if (files.length === 0) {
    return NextResponse.json({ error: "no files provided" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "too many files" }, { status: 400 });
  }
  if (files.some((file) => !ALLOWED_TYPES.includes(file.type))) {
    return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
  }
  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    return NextResponse.json({ error: "file too large" }, { status: 400 });
  }

  const assets = await prisma.$transaction(
    await Promise.all(
      files.map(async (file, order) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          fileName: file.name.slice(0, 255),
          mimeType: file.type,
          size: file.size,
          data: buffer,
          imageHash: await computeImageHash(buffer),
          order,
        };
      }),
    ).then((items) =>
      items.map((data) =>
        prisma.imageAsset.create({
          data,
          select: { id: true, fileName: true, mimeType: true, size: true, order: true },
        }),
      ),
    ),
  );

  return NextResponse.json(
    {
      images: assets.map((asset) => ({
        ...asset,
        url: `/api/images/${asset.id}`,
      })),
    },
    { status: 201 },
  );
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "image id required" }, { status: 400 });
  }
  await prisma.imageAsset.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
