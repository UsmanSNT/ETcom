"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ShieldIcon, TruckIcon, HeadsetIcon, RefreshIcon, CartIcon } from "@/components/icons/SolutionIcons";
import styles from "./page.module.css";

type Product = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  categoryKo: string | null;
  categoryEn: string | null;
  price: number | null;
  images: Array<{ id: string; url: string }>;
  slug: string | null;
};

const TRUST_ITEMS = [
  { icon: ShieldIcon, titleKey: "trust1Title", descKey: "trust1Desc" },
  { icon: TruckIcon, titleKey: "trust2Title", descKey: "trust2Desc" },
  { icon: HeadsetIcon, titleKey: "trust3Title", descKey: "trust3Desc" },
  { icon: RefreshIcon, titleKey: "trust4Title", descKey: "trust4Desc" },
] as const;

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => {
    if (!products) return [];
    const names = new Set<string>();
    products.forEach((p) => {
      const name = locale === "ko" ? p.categoryKo : p.categoryEn;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [products, locale]);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "all") return products;
    return products.filter((p) => (locale === "ko" ? p.categoryKo : p.categoryEn) === activeCategory);
  }, [products, activeCategory, locale]);

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>HOME &gt; Products &gt; {t.products.breadcrumb}</div>
          <h1 className={styles.title}>{t.products.title}</h1>
          <p className={styles.desc}>
            {t.products.desc1}
            <br />
            {t.products.desc2}
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeCategory === "all" ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              {t.products.all} ({products?.length ?? 0})
            </button>
            {categories.map((name) => {
              const count = products?.filter((p) => (locale === "ko" ? p.categoryKo : p.categoryEn) === name).length ?? 0;
              return (
                <button
                  key={name}
                  type="button"
                  className={`${styles.tab} ${activeCategory === name ? styles.tabActive : ""}`}
                  onClick={() => setActiveCategory(name)}
                >
                  {name} ({count})
                </button>
              );
            })}
          </div>
          <div className={styles.sortRow}>
            <span>
              {filtered.length}
              {t.products.countSuffix}
            </span>
            <select className={styles.sortSelect} defaultValue="latest">
              <option value="latest">{t.products.sort}</option>
            </select>
          </div>
        </div>

        {products && filtered.length === 0 ? (
          <p className={styles.empty}>{t.products.empty}</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => {
              const category = locale === "ko" ? p.categoryKo : p.categoryEn;
              return (
                <Link key={p.id} href={`/products/${p.slug ?? p.id}`} className={styles.card}>
                  {p.images?.[0]?.url || p.thumbnailUrl ? (
                    <img className={styles.thumb} src={p.images?.[0]?.url ?? p.thumbnailUrl ?? ""} alt={locale === "ko" ? p.titleKo : p.titleEn} />
                  ) : (
                    <div className={styles.thumb} />
                  )}
                  <div className={styles.cardBody}>
                    {category && <div className={styles.cardCategory}>{category}</div>}
                    <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
                    <div className={styles.cardBottom}>
                      <span className={styles.cardPrice}>{p.price ? `₩ ${p.price.toLocaleString()}` : ""}</span>
                      <span className={styles.cartBtn}>
                        <CartIcon width={15} height={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageBtn}>←</span>
            <span className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</span>
            <span className={styles.pageBtn}>→</span>
          </div>
        )}

        <div className={styles.trustRow}>
          {TRUST_ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className={styles.trustItem}>
              <Icon className={styles.trustIcon} />
              <div className={styles.trustTitle}>{t.products[titleKey]}</div>
              <div className={styles.trustDesc}>{t.products[descKey]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
