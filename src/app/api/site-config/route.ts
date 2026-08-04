import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany();
    const result: Record<string, string> = {};
    for (const c of configs) result[c.key] = c.value;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}
