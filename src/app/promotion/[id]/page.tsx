import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromotionDetailClient } from "./PromotionDetailClient";

async function getPost(id: string) {
  const post = await prisma.promotionPost.findUnique({ where: { id } });
  if (!post || !post.isPublished) return null;
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.titleKo,
    description: post.seoDescription ?? post.contentKo.slice(0, 150),
    openGraph: {
      title: post.seoTitle ?? post.titleKo,
      description: post.seoDescription ?? post.contentKo.slice(0, 150),
      images: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
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

  return <PromotionDetailClient post={post} />;
}
