"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "../../products/[id]/page.module.css";

type Post = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  images: Array<{ id: string; url: string }>;
};

export function PromotionDetailClient({ post }: { post: Post }) {
  const { locale } = useLanguage();

  return (
    <div className={styles.container}>
      {(post.images?.length ? post.images : post.thumbnailUrl ? [{ id: "legacy", url: post.thumbnailUrl }] : []).map((image, index) => (
        <img
          key={image.id}
          className={styles.thumb}
          src={image.url}
          alt={`${locale === "ko" ? post.titleKo : post.titleEn} ${index + 1}`}
        />
      ))}
      <h1 className={styles.title}>{locale === "ko" ? post.titleKo : post.titleEn}</h1>
      <p className={styles.desc}>{locale === "ko" ? post.contentKo : post.contentEn}</p>
    </div>
  );
}
