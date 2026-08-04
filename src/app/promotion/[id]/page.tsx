import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromotionDetailClient } from "./PromotionDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getPost(id: string) {
  const post = await prisma.promotionPost.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true } },
      category: { select: { id: true, slug: true, nameKo: true, nameEn: true } },
    },
  });
  if (!post || !post.isPublished) return null;
  return post;
}

async function getRelatedPosts(categoryId: string, excludeId: string) {
  return prisma.promotionPost.findMany({
    where: { categoryId, isPublished: true, NOT: { id: excludeId } },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: {
      id: true, slug: true, titleKo: true, titleEn: true, publishedAt: true,
      thumbnailUrl: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { id: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return {};
  const canonical = post.canonicalUrl ?? `${BASE_URL}/promotion/${post.slug ?? post.id}`;
  const image = post.images[0] ? `${BASE_URL}/api/images/${post.images[0].id}` : post.thumbnailUrl ?? undefined;

  return {
    title: post.seoTitle ?? post.titleKo,
    description: post.seoDescription ?? post.contentKo.slice(0, 150),
    alternates: { canonical },
    robots: {
      index: !post.noIndex,
      follow: !post.noIndex,
    },
    openGraph: {
      title: post.ogTitle ?? post.seoTitle ?? post.titleKo,
      description: post.ogDescription ?? post.seoDescription ?? post.contentKo.slice(0, 150),
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.ogTitle ?? post.seoTitle ?? post.titleKo,
      description: post.ogDescription ?? post.seoDescription ?? post.contentKo.slice(0, 150),
      images: image ? [image] : undefined,
    },
  };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const relatedPosts = post.category
    ? await getRelatedPosts(post.category.id, post.id)
    : [];
  const postUrl = post.canonicalUrl ?? `${BASE_URL}/promotion/${post.slug ?? post.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.ogTitle ?? post.seoTitle ?? post.titleKo,
    description: post.ogDescription ?? post.seoDescription ?? post.contentKo.slice(0, 150),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: postUrl,
    image: post.images.map((image) => `${BASE_URL}/api/images/${image.id}`),
    publisher: {
      "@type": "Organization",
      name: "ETCOMPANY",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PromotionDetailClient
        post={{
          ...post,
          images: post.images.map((image) => ({ id: image.id, url: `/api/images/${image.id}` })),
          category: post.category ?? undefined,
        }}
        relatedPosts={relatedPosts.map((p) => ({
          ...p,
          imageUrl: p.images[0] ? `/api/images/${p.images[0].id}` : p.thumbnailUrl,
          publishedAt: p.publishedAt.toISOString(),
        }))}
      />
    </>
  );
}
