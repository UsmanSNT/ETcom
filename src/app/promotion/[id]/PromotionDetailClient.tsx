"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "../../products/[id]/page.module.css";

type Post = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
};

export function PromotionDetailClient({ post }: { post: Post }) {
  const { locale } = useLanguage();

  return (
    <div className={styles.container}>
      {post.thumbnailUrl && (
        <img className={styles.thumb} src={post.thumbnailUrl} alt={locale === "ko" ? post.titleKo : post.titleEn} />
      )}
      <h1 className={styles.title}>{locale === "ko" ? post.titleKo : post.titleEn}</h1>
      <p className={styles.desc}>{locale === "ko" ? post.contentKo : post.contentEn}</p>
    </div>
  );
}
