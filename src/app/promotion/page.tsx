"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Post = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  publishedAt: string;
  category: { id: string; nameKo: string; nameEn: string };
};

export default function PromotionPage() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/promotion/posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  const categories = useMemo(() => {
    if (!posts) return [];
    const map = new Map<string, string>();
    posts.forEach((p) => map.set(p.category.id, locale === "ko" ? p.category.nameKo : p.category.nameEn));
    return Array.from(map.entries());
  }, [posts, locale]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (activeCategory === "all") return posts;
    return posts.filter((p) => p.category.id === activeCategory);
  }, [posts, activeCategory]);

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>HOME &gt; {t.promotion.breadcrumb}</div>
          <h1 className={styles.title}>{t.promotion.title}</h1>
          <p className={styles.desc}>
            {t.promotion.desc1}
            <br />
            {t.promotion.desc2}
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeCategory === "all" ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            {t.products.all}
          </button>
          {categories.map(([id, name]) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${activeCategory === id ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory(id)}
            >
              {name}
            </button>
          ))}
        </div>

        {posts && filtered.length === 0 ? (
          <p className={styles.empty}>{t.promotion.empty}</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <Link key={p.id} href={`/promotion/${p.id}`} className={styles.card}>
                {p.thumbnailUrl ? (
                  <img className={styles.thumb} src={p.thumbnailUrl} alt={locale === "ko" ? p.titleKo : p.titleEn} />
                ) : (
                  <div className={styles.thumb} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardCategory}>{locale === "ko" ? p.category.nameKo : p.category.nameEn}</div>
                  <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
                  <div className={styles.cardDate}>
                    {new Date(p.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.newsletter}>
          <div className={styles.newsletterTitle}>
            {t.promotion.newsletterTitle}
            <br />
            {t.promotion.newsletterTitle2}
          </div>
          <div className={styles.newsletterRow}>
            <input className={styles.newsletterInput} placeholder={t.promotion.newsletterPlaceholder} disabled />
            <button className={styles.newsletterBtn} disabled>
              {t.promotion.newsletterBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
