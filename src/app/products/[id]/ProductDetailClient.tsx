"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { StarRatingDisplay } from "@/components/StarRating";
import styles from "./page.module.css";

const ZOOM_SCALE = 2.4;

type Product = {
  id: string;
  slug: string | null;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  categoryKo: string | null;
  categoryEn: string | null;
  price: number | null;
  images: Array<{ id: string; url: string }>;
  avgRating: number | null;
  reviewCount: number;
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
  const { locale, t } = useLanguage();
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
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [lens, setLens] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const [avgRating] = useState(product.avgRating);
  const [reviewCount] = useState(product.reviewCount);

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
    const lensWidth = rect.width / ZOOM_SCALE;
    const lensHeight = rect.height / ZOOM_SCALE;
    const rawLeft = clientX - rect.left - lensWidth / 2;
    const rawTop = clientY - rect.top - lensHeight / 2;
    setFrameSize({ width: rect.width, height: rect.height });
    setLens({
      left: Math.min(Math.max(rawLeft, 0), rect.width - lensWidth),
      top: Math.min(Math.max(rawTop, 0), rect.height - lensHeight),
      width: lensWidth,
      height: lensHeight,
    });
  }

  const activeImage = images[selected];

  const zoomFractionX = lens.width < frameSize.width ? lens.left / (frameSize.width - lens.width) : 0.5;
  const zoomFractionY = lens.height < frameSize.height ? lens.top / (frameSize.height - lens.height) : 0.5;
  const panelImageWidth = frameSize.width * ZOOM_SCALE;
  const panelImageHeight = frameSize.height * ZOOM_SCALE;

  return (
    <div className={styles.container}>
      <div className={styles.detailLayout}>
        <div className={styles.gallery}>
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

          <div className={styles.imageStage}>
            <div
              ref={frameRef}
              className={styles.mainImageFrame}
              onMouseEnter={(event) => {
                if (!activeImage) return;
                setHoverZoom(true);
                trackPointer(event.clientX, event.clientY);
              }}
              onMouseLeave={() => setHoverZoom(false)}
              onMouseMove={(event) => hoverZoom && trackPointer(event.clientX, event.clientY)}
              onClick={() => activeImage && setZoomed(true)}
            >
              {activeImage ? (
                <img className={styles.mainImage} src={activeImage.url} alt={`${title} ${selected + 1}`} />
              ) : (
                <span className={styles.noImage}>{locale === "ko" ? "등록된 이미지가 없습니다." : "No image available"}</span>
              )}

              {hoverZoom && activeImage && (
                <div
                  className={styles.lens}
                  style={{ left: lens.left, top: lens.top, width: lens.width, height: lens.height }}
                />
              )}

              {activeImage && (
                <span className={styles.zoomHint}>
                  {locale === "ko" ? "클릭하여 전체 이미지 보기" : "Click to view full image"}
                </span>
              )}
            </div>

            {hoverZoom && activeImage && frameSize.width > 0 && (
              <div className={styles.zoomPanel} aria-hidden="true">
                <img
                  src={activeImage.url}
                  alt=""
                  className={styles.zoomPanelImage}
                  style={{
                    width: panelImageWidth,
                    height: panelImageHeight,
                    left: -zoomFractionX * (panelImageWidth - frameSize.width),
                    top: -zoomFractionY * (panelImageHeight - frameSize.height),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.productInfo}>
          {category && <div className={styles.category}>{category}</div>}
          <h1 className={styles.title}>{title}</h1>

          {reviewCount > 0 ? (
            <div className={styles.ratingSummary}>
              <StarRatingDisplay value={avgRating ?? 0} size={16} />
              <strong>{(avgRating ?? 0).toFixed(1)}</strong>
              <span>
                {t.products.reviewsLabel} {reviewCount}
                {t.products.reviewCountSuffix}
              </span>
            </div>
          ) : (
            <div className={styles.ratingSummaryEmpty}>{t.products.noReviewsYet}</div>
          )}

          {product.price && <div className={styles.price}>₩{product.price.toLocaleString()}</div>}
          <p className={styles.desc}>{locale === "ko" ? product.descriptionKo : product.descriptionEn}</p>

          <div className={styles.reviewBox}>
            <div className={styles.reviewBoxTitle}>{locale === "ko" ? "제품 문의" : "Product Inquiry"}</div>
            <p className={styles.reviewHint}>{locale === "ko" ? "이 제품에 대해 궁금한 점이 있으신가요? 전문 엔지니어가 신속히 답변드립니다." : "Have questions about this product? Our engineers will respond quickly."}</p>
            <Link href="/contact" className={styles.reviewSubmitBtn} style={{ display: "inline-flex", textDecoration: "none", textAlign: "center", justifyContent: "center" }}>
              {locale === "ko" ? "문의하기" : "Contact Us"} →
            </Link>
          </div>
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
