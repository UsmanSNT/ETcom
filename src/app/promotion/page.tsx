"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "../products/page.module.css";

type Post = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  category: { nameKo: string; nameEn: string };
};

export default function PromotionPage() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    fetch("/api/promotion/posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.promotion.title}</h1>

      {posts && posts.length === 0 && <p className={styles.empty}>{t.promotion.empty}</p>}

      <div className={styles.grid}>
        {posts?.map((p) => (
          <Link key={p.id} href={`/promotion/${p.id}`} className={styles.card}>
            {p.thumbnailUrl ? (
              <img className={styles.thumb} src={p.thumbnailUrl} alt={locale === "ko" ? p.titleKo : p.titleEn} />
            ) : (
              <div className={styles.thumb} />
            )}
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
              <div className={styles.cardDesc}>{locale === "ko" ? p.contentKo : p.contentEn}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
