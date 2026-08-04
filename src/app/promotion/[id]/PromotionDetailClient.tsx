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
            <div className={styles.thumbs}>
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  className={`${styles.thumbButton} ${selected === index ? styles.thumbActive : ""}`}
                  onClick={() => setSelected(index)}
                  aria-label={`${title} ${index + 1}`}
                  aria-pressed={selected === index}
                >
                  <img src={image.url} alt="" />
                </button>
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

      {/* 구독하기 */}
      <div className={listStyles.newsletter}>
        <svg className={listStyles.newsletterIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
          <path d="m3.5 6 8.5 7 8.5-7M3.5 18l6-6M20.5 18l-6-6" />
        </svg>
        <div className={listStyles.newsletterTitle}>
          {t.promotion.newsletterTitle}
          <br />
          {t.promotion.newsletterTitle2}
        </div>
        <div className={listStyles.newsletterRow}>
          <input
            className={listStyles.newsletterInput}
            type="email"
            placeholder={t.promotion.newsletterPlaceholder}
          />
          <button
            className={listStyles.newsletterBtn}
            type="button"
            onClick={() =>
              alert(
                locale === "ko"
                  ? "뉴스레터 구독 기능을 준비 중입니다."
                  : "Newsletter subscriptions are coming soon.",
              )
            }
          >
            {t.promotion.newsletterBtn}
          </button>
        </div>
      </div>

    </div>
  );
}
