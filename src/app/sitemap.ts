import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// DB'ga bog'liq bo'lgani uchun build vaqtida emas, so'rov kelganda generatsiya qilinadi
// (aks holda DB build paytida yetib bo'lmasa, `next build` butunlay muvaffaqiyatsiz bo'ladi)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/business",
    "/products",
    "/rd",
    "/portfolio",
    "/promotion",
    "/contact",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const [products, posts] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
    prisma.promotionPost.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/promotion/${p.id}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
