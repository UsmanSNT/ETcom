import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
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

  return {
    title: product.seoTitle ?? product.titleKo,
    description: product.seoDescription ?? product.descriptionKo,
    openGraph: {
      title: product.seoTitle ?? product.titleKo,
      description: product.seoDescription ?? product.descriptionKo,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : undefined,
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

  return <ProductDetailClient product={product} />;
}
