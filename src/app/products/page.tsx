"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Product = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
};

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.products.title}</h1>

      {products && products.length === 0 && <p className={styles.empty}>{t.products.empty}</p>}

      <div className={styles.grid}>
        {products?.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className={styles.card}>
            {p.thumbnailUrl ? (
              <img className={styles.thumb} src={p.thumbnailUrl} alt={locale === "ko" ? p.titleKo : p.titleEn} />
            ) : (
              <div className={styles.thumb} />
            )}
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
              <div className={styles.cardDesc}>{locale === "ko" ? p.descriptionKo : p.descriptionEn}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
