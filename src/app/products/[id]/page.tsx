import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getProduct(id: string) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!product || !product.isPublished) return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  const canonical = product.canonicalUrl ?? `${BASE_URL}/products/${product.slug ?? product.id}`;
  const image = product.images[0] ? `${BASE_URL}/api/images/${product.images[0].id}` : product.thumbnailUrl ?? undefined;

  return {
    title: product.seoTitle ?? product.titleKo,
    description: product.seoDescription ?? product.descriptionKo,
    alternates: { canonical },
    robots: {
      index: !product.noIndex,
      follow: !product.noIndex,
    },
    openGraph: {
      title: product.ogTitle ?? product.seoTitle ?? product.titleKo,
      description: product.ogDescription ?? product.seoDescription ?? product.descriptionKo,
      url: canonical,
      type: "website",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.ogTitle ?? product.seoTitle ?? product.titleKo,
      description: product.ogDescription ?? product.seoDescription ?? product.descriptionKo,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const allCategories = await prisma.product.findMany({
    where: { isPublished: true },
    select: { categoryKo: true, categoryEn: true },
    distinct: ["categoryKo", "categoryEn"],
  });
  const categories = allCategories
    .filter((c) => c.categoryKo || c.categoryEn)
    .map((c) => ({ ko: c.categoryKo ?? "", en: c.categoryEn ?? "" }));

  const relatedProducts = await prisma.product.findMany({
    where: { isPublished: true, id: { not: product.id } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 12,
    select: {
      id: true,
      slug: true,
      titleKo: true,
      titleEn: true,
      price: true,
      thumbnailUrl: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { id: true } },
    },
  });
  const productUrl = product.canonicalUrl ?? `${BASE_URL}/products/${product.slug ?? product.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.titleKo,
    description: product.seoDescription ?? product.descriptionKo,
    url: productUrl,
    image: product.images.map((image) => `${BASE_URL}/api/images/${image.id}`),
    brand: { "@type": "Brand", name: "ETCOMPANY" },
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "KRW",
            price: product.price,
            availability: "https://schema.org/InStock",
            url: productUrl,
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetailClient
        categories={categories}
        product={{
          ...product,
          images: product.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
          avgRating: product.reviews.length
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : null,
          reviewCount: product.reviews.length,
        }}
        relatedProducts={relatedProducts.map((item) => ({
          ...item,
          imageUrl: item.images[0] ? `/api/images/${item.images[0].id}` : item.thumbnailUrl,
        }))}
      />
    </>
  );
}
