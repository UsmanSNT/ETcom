"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { StarRatingDisplay } from "@/components/StarRating";
import { CameraIcon, CloseIcon, HeadsetIcon, SearchIcon } from "@/components/icons/SolutionIcons";
import { ProductCategoryNav } from "../ProductCategoryNav";
import styles from "./page.module.css";
import shopStyles from "../page.module.css";

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
  purchaseUrl: string | null;
  images: Array<{ id: string; url: string }>;
  detailImages: Array<{ id: string; url: string }>;
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

type HierarchicalCategory = {
  id: string;
  nameKo: string;
  nameEn: string;
  children: { id: string; nameKo: string; nameEn: string }[];
};

export function ProductDetailClient({
  hierarchicalCategories,
  product,
  relatedProducts,
}: {
  hierarchicalCategories: HierarchicalCategory[];
  product: Product;
  relatedProducts: RelatedProduct[];
}) {
  const { locale, t } = useLanguage();
  const router = useRouter();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [imageSearching, setImageSearching] = useState(false);
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOrigin, setViewerOrigin] = useState("50% 50%");
  const [hoverZoom, setHoverZoom] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [lens, setLens] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerPointerStart = useRef({ x: 0, y: 0 });

  const [avgRating] = useState(product.avgRating);
  const [reviewCount] = useState(product.reviewCount);

  useEffect(() => {
    const toggle = () => setSidebarOpen((v) => !v);
    window.addEventListener("etc:toggle-product-sidebar", toggle);
    return () => window.removeEventListener("etc:toggle-product-sidebar", toggle);
  }, []);

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

  function zoomViewerAt(clientX: number, clientY: number, element: HTMLImageElement) {
    const rect = element.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setViewerOrigin(`${x}% ${y}%`);
    setViewerScale((scale) => scale > 1 ? 1 : 2.5);
  }

  function selectImage(index: number) {
    setSelected(index);
    setViewerScale(1);
    setViewerOrigin("50% 50%");
  }

  function openViewer() {
    setViewerScale(1);
    setViewerOrigin("50% 50%");
    setZoomed(true);
  }

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

  function submitProductSearch(event: FormEvent) {
    event.preventDefault();
    const query = productSearch.trim();
    router.push(`/products?view=all${query ? `&q=${encodeURIComponent(query)}` : ""}#all-products`);
  }

  async function searchByImage(file: File) {
    setImageSearching(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/products/search-by-image", { method: "POST", body: formData });
      if (!response.ok) throw new Error();
      const results = await response.json();
      sessionStorage.setItem("product-image-search-results", JSON.stringify(results));
      router.push("/products?view=all&imageSearch=stored#all-products");
    } finally {
      setImageSearching(false);
    }
  }

  const zoomFractionX = lens.width < frameSize.width ? lens.left / (frameSize.width - lens.width) : 0.5;
  const zoomFractionY = lens.height < frameSize.height ? lens.top / (frameSize.height - lens.height) : 0.5;
  const panelImageWidth = frameSize.width * ZOOM_SCALE;
  const panelImageHeight = frameSize.height * ZOOM_SCALE;
  const activeNavCategory = hierarchicalCategories
    .flatMap((parent) => [parent, ...parent.children])
    .find((item) => item.nameKo === product.categoryKo || item.nameEn === product.categoryEn)?.id;

  return (
    <div className={styles.pageLayout}>
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={styles.categorySidebar}
        style={sidebarOpen ? { transform: "translateX(0)", boxShadow: "4px 0 24px rgba(0,0,0,.12)" } : undefined}
      >
        <ProductCategoryNav categories={hierarchicalCategories} locale={locale} activeCategory={activeNavCategory} />

        <div className={shopStyles.sidebarContact}>
          <HeadsetIcon />
          <strong>{t.products.inquiryTitle}</strong>
          <p>{t.products.inquiryDesc}</p>
          <Link href="/contact">{t.products.inquiryBtn} →</Link>
        </div>

<div className={shopStyles.customDevelopment}>
          <strong>맞춤형 개발이<br />필요하신가요?</strong>
          <p>고객의 요구에 맞춘 하드웨어 및 소프트웨어 개발 서비스를 제공합니다.</p>
          <Link href="/contact">자세히 보기 →</Link>
        </div>
      </aside>
      <div className={styles.container}>
      <form className={`${shopStyles.searchBar} ${styles.detailSearchBar}`} onSubmit={submitProductSearch} role="search">
        <SearchIcon className={shopStyles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={shopStyles.searchInput}
          placeholder={t.products.searchPlaceholder}
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          aria-label={t.products.searchLabel}
        />
        {productSearch && <button type="button" className={shopStyles.searchClearBtn} onClick={() => setProductSearch("")} aria-label={t.products.searchClear}><CloseIcon /></button>}
        <label className={shopStyles.imageSearchBtn} aria-label={t.products.imageSearchLabel} title={t.products.imageSearchLabel}>
          <CameraIcon />
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden disabled={imageSearching} onChange={(event) => { const file = event.target.files?.[0]; if (file) void searchByImage(file); event.target.value = ""; }} />
        </label>
        <button type="submit" className={shopStyles.searchSubmitBtn}>{imageSearching ? t.products.imageSearchLoading : t.products.searchLabel}</button>
      </form>
      <div className={styles.detailLayout}>
        <div className={styles.gallery}>
          {images.length > 1 && (
            <div className={styles.thumbnailList} aria-label={locale === "ko" ? "제품 이미지 목록" : "Product images"}>
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  className={`${styles.thumbnailButton} ${selected === index ? styles.thumbnailActive : ""}`}
                  onClick={() => selectImage(index)}
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
              onClick={() => activeImage && openViewer()}
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

          <ProductInquiryForm productTitle={title} locale={locale} />

          {product.purchaseUrl && (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.purchaseBtn}
            >
              {locale === "ko" ? "제품 구매하기" : "Purchase Product"} →
            </a>
          )}
        </div>
      </div>

      {((locale === "ko" ? product.descriptionKo : product.descriptionEn) || product.detailImages.length > 0) && (
        <section className={styles.detailDescSection}>
          <h2 className={styles.detailDescTitle}>
            {locale === "ko" ? "상세설명" : "Product Details"}
          </h2>
          {(locale === "ko" ? product.descriptionKo : product.descriptionEn) && (
            <div className={styles.detailDescText}>
              {locale === "ko" ? product.descriptionKo : product.descriptionEn}
            </div>
          )}
          <div className={styles.detailDescImages}>
            {product.detailImages.map((img, idx) => (
              <img
                key={img.id}
                src={img.url}
                alt={`${title} ${locale === "ko" ? "상세" : "detail"} ${idx + 1}`}
                className={styles.detailDescImg}
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

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
              <div className={styles.lightboxControls} aria-label={locale === "ko" ? "이미지 확대 제어" : "Image zoom controls"}>
                <button type="button" onClick={() => setViewerScale((scale) => Math.max(1, scale - .5))} aria-label="Zoom out">−</button>
                <span>{Math.round(viewerScale * 100)}%</span>
                <button type="button" onClick={() => setViewerScale((scale) => Math.min(4, scale + .5))} aria-label="Zoom in">+</button>
              </div>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setZoomed(false)}
                aria-label={locale === "ko" ? "닫기" : "Close"}
              >
                ×
              </button>
            </div>
            <div className={`${styles.lightboxBody} ${viewerScale > 1 ? styles.lightboxBodyZoomed : ""}`}>
              <img
                src={activeImage.url}
                alt={`${title} ${selected + 1}`}
                draggable={false}
                style={{ transform: `scale(${viewerScale})`, transformOrigin: viewerOrigin }}
                onPointerDown={(event) => {
                  viewerPointerStart.current = { x: event.clientX, y: event.clientY };
                }}
                onPointerUp={(event) => {
                  const moved = Math.hypot(
                    event.clientX - viewerPointerStart.current.x,
                    event.clientY - viewerPointerStart.current.y,
                  );
                  if (moved < 10) zoomViewerAt(event.clientX, event.clientY, event.currentTarget);
                }}
              />
            </div>
            {images.length > 1 && (
              <div className={styles.lightboxThumbs}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    className={`${styles.thumbnailButton} ${selected === index ? styles.thumbnailActive : ""}`}
                    onClick={() => selectImage(index)}
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
    </div>
  );
}

function ProductInquiryForm({ productTitle, locale }: { productTitle: string; locale: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          type: "product",
          company: "",
          consent: true,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.inquiryBox}>
      <div className={styles.inquiryTitle}>
        {locale === "ko" ? "제품 문의" : "Product Inquiry"}
      </div>
      <p className={styles.inquiryDesc}>
        {locale === "ko"
          ? "이 제품에 대해 궁금한 점이 있으시면 아래 양식을 작성해 주세요."
          : "Fill out the form below for any questions about this product."}
      </p>
      {status === "success" ? (
        <div className={styles.inquirySuccess}>
          {locale === "ko" ? "문의가 접수되었습니다. 빠르게 답변드리겠습니다." : "Your inquiry has been submitted. We'll respond shortly."}
        </div>
      ) : (
        <form className={styles.inquiryForm} onSubmit={handleSubmit}>
          <input type="hidden" name="product" value={productTitle} />
          <div className={styles.inquiryRow}>
            <input className={styles.inquiryInput} name="name" placeholder={locale === "ko" ? "이름 *" : "Name *"} required />
            <input className={styles.inquiryInput} name="phone" placeholder={locale === "ko" ? "연락처 *" : "Phone *"} required />
          </div>
          <input className={styles.inquiryInput} name="email" type="email" placeholder={locale === "ko" ? "이메일 *" : "Email *"} required />
          <textarea
            className={styles.inquiryTextarea}
            name="message"
            rows={3}
            placeholder={locale === "ko" ? "문의 내용을 입력해주세요" : "Enter your inquiry"}
            required
          />
          <button className={styles.inquirySubmit} type="submit" disabled={status === "loading"}>
            {status === "loading"
              ? (locale === "ko" ? "전송 중..." : "Sending...")
              : (locale === "ko" ? "문의하기" : "Submit Inquiry")} →
          </button>
          {status === "error" && (
            <p className={styles.inquiryError}>
              {locale === "ko" ? "전송에 실패했습니다. 다시 시도해주세요." : "Failed to send. Please try again."}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
