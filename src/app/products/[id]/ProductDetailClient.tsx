"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

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

  const activeImage = images[selected];

  return (
    <div className={styles.container}>
      <div className={styles.detailLayout}>
        <div className={styles.gallery}>
          <button
            type="button"
            className={styles.mainImageButton}
            onClick={() => activeImage && setZoomed(true)}
            disabled={!activeImage}
            aria-label={locale === "ko" ? "제품 이미지 크게 보기" : "View product image"}
          >
            {activeImage ? (
              <img className={styles.mainImage} src={activeImage.url} alt={`${title} ${selected + 1}`} />
            ) : (
              <span className={styles.noImage}>{locale === "ko" ? "등록된 이미지가 없습니다." : "No image available"}</span>
            )}
            {activeImage && <span className={styles.zoomHint}>{locale === "ko" ? "클릭하여 확대" : "Click to enlarge"}</span>}
          </button>

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
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={title} onClick={() => setZoomed(false)}>
          <button type="button" className={styles.lightboxClose} onClick={() => setZoomed(false)} aria-label={locale === "ko" ? "닫기" : "Close"}>×</button>
          <img src={activeImage.url} alt={`${title} ${selected + 1}`} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
