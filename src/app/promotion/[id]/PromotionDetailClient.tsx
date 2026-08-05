"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";
import listStyles from "../page.module.css";

// Hero + Tabs are rendered by layout.tsx — this component only renders article content

type Post = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  publishedAt: Date | string;
  images: Array<{ id: string; url: string }>;
  category?: { id: string; slug: string; nameKo: string; nameEn: string };
};

type RelatedPost = {
  id: string;
  slug: string | null;
  titleKo: string;
  titleEn: string;
  publishedAt: string;
  imageUrl: string | null;
};


export function PromotionDetailClient({
  post,
  relatedPosts = [],
}: {
  post: Post;
  relatedPosts?: RelatedPost[];
}) {
  const { t, locale } = useLanguage();
  const title = locale === "ko" ? post.titleKo : post.titleEn;
  const content = locale === "ko" ? post.contentKo : post.contentEn;

  const images = useMemo(
    () =>
      post.images?.length
        ? post.images
        : post.thumbnailUrl
          ? [{ id: "legacy", url: post.thumbnailUrl }]
          : [],
    [post.images, post.thumbnailUrl],
  );

  const [selected, setSelected] = useState(0);

  const step = useCallback(
    (delta: number) => {
      setSelected((current) => (current + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (images.length < 2) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [images.length, step]);

  const activeImage = images[selected];
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    locale === "ko" ? "ko-KR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className={styles.container}>

      {/* 1. Title */}
      <h1 className={styles.title}>{title}</h1>

      {/* 2. Image with date overlay */}
      {activeImage && (
        <div className={styles.imageWrap}>
          <div className={styles.stage}>
            <img
              className={styles.stageImage}
              src={activeImage.url}
              alt={`${title} ${selected + 1}`}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={() => step(-1)}
                  aria-label={locale === "ko" ? "이전 이미지" : "Previous image"}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={() => step(1)}
                  aria-label={locale === "ko" ? "다음 이미지" : "Next image"}
                >
                  ›
                </button>
                <span className={styles.counter}>{selected + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.dots}>
              {images.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`${styles.dot} ${selected === index ? styles.dotActive : ""}`}
                  onClick={() => setSelected(index)}
                  aria-label={`${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}


      {/* 3. Content */}
      <p className={styles.content}>{content}</p>

      {/* 4. Date after content */}
      <time className={styles.dateText}>{formattedDate}</time>

      {/* 5. Back button — right below article */}
      <div className={styles.backRow}>
        <Link href="/promotion" className={styles.backBtn}>
          ← {locale === "ko" ? "목록" : "List"}
        </Link>
      </div>

      {/* 6. Related posts */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>
            {locale === "ko" ? "관련 게시물" : "Related Posts"}
          </h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map((p) => (
              <Link
                key={p.id}
                href={`/promotion/${p.slug ?? p.id}`}
                className={styles.relatedCard}
                scroll={false}
              >
                <div className={styles.relatedThumb}>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={locale === "ko" ? p.titleKo : p.titleEn}
                    />
                  )}
                </div>
                <strong className={styles.relatedCardTitle}>
                  {locale === "ko" ? p.titleKo : p.titleEn}
                </strong>
                <time className={styles.relatedCardDate}>
                  {new Date(p.publishedAt).toISOString().slice(0, 10).replaceAll("-", ".")}
                </time>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
