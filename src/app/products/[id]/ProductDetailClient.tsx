"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const ZOOM_SCALE = 2.4;

type Product = {
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  categoryKo: string | null;
  categoryEn: string | null;
  price: number | null;
  images: Array<{ id: string; url: string }>;
};

type RelatedProduct = {
  id: string;
  slug: string | null;
  titleKo: string;
  titleEn: string;
  price: number | null;
  imageUrl: string | null;
};

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: RelatedProduct[];
}) {
  const { locale } = useLanguage();
  const category = locale === "ko" ? product.categoryKo : product.categoryEn;
  const title = locale === "ko" ? product.titleKo : product.titleEn;
  const images = useMemo(
    () => product.images?.length
      ? product.images
      : product.thumbnailUrl
        ? [{ id: "legacy", url: product.thumbnailUrl }]
        : [],
    [product.images, product.thumbnailUrl],
  );
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoomed) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomed(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  function trackPointer(clientX: number, clientY: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  const activeImage = images[selected];

  return (
    <div className={styles.container}>
      <div className={styles.detailLayout}>
        <div className={styles.gallery}>
          <div
            ref={frameRef}
            className={styles.mainImageFrame}
            onMouseEnter={() => activeImage && setHoverZoom(true)}
            onMouseLeave={() => setHoverZoom(false)}
            onMouseMove={(event) => hoverZoom && trackPointer(event.clientX, event.clientY)}
            onTouchStart={(event) => {
              if (!activeImage) return;
              setHoverZoom(true);
              trackPointer(event.touches[0].clientX, event.touches[0].clientY);
            }}
            onTouchMove={(event) => {
              if (!hoverZoom) return;
              event.preventDefault();
              trackPointer(event.touches[0].clientX, event.touches[0].clientY);
            }}
            onTouchEnd={() => setHoverZoom(false)}
          >
            {activeImage ? (
              <img
                className={styles.mainImage}
                src={activeImage.url}
                alt={`${title} ${selected + 1}`}
                style={{
                  transform: hoverZoom ? `scale(${ZOOM_SCALE})` : "scale(1)",
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
              />
            ) : (
              <span className={styles.noImage}>{locale === "ko" ? "등록된 이미지가 없습니다." : "No image available"}</span>
            )}
            {activeImage && (
              <button
                type="button"
                className={styles.zoomHint}
                onClick={() => setZoomed(true)}
                aria-label={locale === "ko" ? "제품 이미지 크게 보기" : "View product image"}
              >
                {locale === "ko" ? "전체 이미지 보기" : "View full image"}
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnailList} aria-label={locale === "ko" ? "제품 이미지 목록" : "Product images"}>
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  className={`${styles.thumbnailButton} ${selected === index ? styles.thumbnailActive : ""}`}
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

        <div className={styles.productInfo}>
          {category && <div className={styles.category}>{category}</div>}
          <h1 className={styles.title}>{title}</h1>
          {product.price && <div className={styles.price}>₩{product.price.toLocaleString()}</div>}
          <p className={styles.desc}>{locale === "ko" ? product.descriptionKo : product.descriptionEn}</p>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <div>
              <span>{locale === "ko" ? "다른 제품" : "OTHER PRODUCTS"}</span>
              <h2>{locale === "ko" ? "함께 살펴보세요" : "Explore more products"}</h2>
            </div>
            <Link href="/products">{locale === "ko" ? "전체 제품 보기" : "View all"} →</Link>
          </div>
          <div className={styles.relatedRail}>
            {relatedProducts.map((item) => {
              const itemTitle = locale === "ko" ? item.titleKo : item.titleEn;
              return (
                <Link
                  key={item.id}
                  href={`/products/${item.slug ?? item.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={itemTitle} /> : <span>No image</span>}
                  </div>
                  <strong>{itemTitle}</strong>
                  {item.price && <small>₩{item.price.toLocaleString()}</small>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {zoomed && activeImage && (
        <div className={styles.lightbox} onClick={() => setZoomed(false)}>
          <div
            className={styles.lightboxPanel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.lightboxHeader}>
              <span>{title}</span>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setZoomed(false)}
                aria-label={locale === "ko" ? "닫기" : "Close"}
              >
                ×
              </button>
            </div>
            <div className={styles.lightboxBody}>
              <img src={activeImage.url} alt={`${title} ${selected + 1}`} />
            </div>
            {images.length > 1 && (
              <div className={styles.lightboxThumbs}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    className={`${styles.thumbnailButton} ${selected === index ? styles.thumbnailActive : ""}`}
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
        </div>
      )}
    </div>
  );
}
