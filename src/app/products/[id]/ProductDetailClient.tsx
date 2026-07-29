"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Product = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const { locale } = useLanguage();

  return (
    <div className={styles.container}>
      {product.thumbnailUrl && (
        <img
          className={styles.thumb}
          src={product.thumbnailUrl}
          alt={locale === "ko" ? product.titleKo : product.titleEn}
        />
      )}
      <h1 className={styles.title}>{locale === "ko" ? product.titleKo : product.titleEn}</h1>
      <p className={styles.desc}>{locale === "ko" ? product.descriptionKo : product.descriptionEn}</p>
    </div>
  );
}
