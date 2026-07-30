"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Product = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  categoryKo: string | null;
  categoryEn: string | null;
  price: number | null;
  images: Array<{ id: string; url: string }>;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const { locale } = useLanguage();
  const category = locale === "ko" ? product.categoryKo : product.categoryEn;

  return (
    <div className={styles.container}>
      {(product.images?.length ? product.images : product.thumbnailUrl ? [{ id: "legacy", url: product.thumbnailUrl }] : []).map((image, index) => (
        <img
          key={image.id}
          className={styles.thumb}
          src={image.url}
          alt={`${locale === "ko" ? product.titleKo : product.titleEn} ${index + 1}`}
        />
      ))}
      {category && <div className={styles.category}>{category}</div>}
      <h1 className={styles.title}>{locale === "ko" ? product.titleKo : product.titleEn}</h1>
      {product.price && <div className={styles.price}>₩ {product.price.toLocaleString()}</div>}
      <p className={styles.desc}>{locale === "ko" ? product.descriptionKo : product.descriptionEn}</p>
    </div>
  );
}
