"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Post = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  publishedAt: Date | string;
  images: Array<{ id: string; url: string }>;
};

export function PromotionDetailClient({ post }: { post: Post }) {
  const { locale } = useLanguage();
  const title = locale === "ko" ? post.titleKo : post.titleEn;

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

  return (
    <div className={styles.container}>
      {activeImage && (
        <div className={styles.slider}>
          <div className={styles.stage}>
            <img className={styles.stageImage} src={activeImage.url} alt={`${title} ${selected + 1}`} />

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
                <span className={styles.counter}>
                  {selected + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbs} aria-label={locale === "ko" ? "이미지 목록" : "Image list"}>
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

      <h1 className={styles.title}>{title}</h1>
      <div className={styles.date}>
        {new Date(post.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
      </div>
      <p className={styles.content}>{locale === "ko" ? post.contentKo : post.contentEn}</p>
    </div>
  );
}
