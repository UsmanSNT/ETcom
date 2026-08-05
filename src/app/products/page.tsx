"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { StarRatingDisplay } from "@/components/StarRating";
import {
  CameraIcon,
  CloseIcon,
  HeadsetIcon,
  SearchIcon,
} from "@/components/icons/SolutionIcons";
import { ProductHeroCarousel } from "./ProductHeroCarousel";
import { ScrollRow } from "@/components/ScrollRow";
import { ProductCategoryNav } from "./ProductCategoryNav";
import styles from "./page.module.css";

type Product = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  categoryKo: string | null;
  categoryEn: string | null;
  price: number | null;
  images: Array<{ id: string; url: string }>;
  slug: string | null;
  avgRating: number | null;
  reviewCount: number;
  popularityScore: number;
  isFeatured: boolean;
  createdAt: string;
};

type HierarchicalCategory = {
  id: string;
  nameKo: string;
  nameEn: string;
  children: { id: string; nameKo: string; nameEn: string }[];
};

const PAGE_SIZE = 8;

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className={styles.shopLayout} />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";
  const showAllProducts = searchParams.get("view") === "all";
  const showStorefront = activeCategory === "all" && !showAllProducts;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const initialQuery = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);
  const [sortBy] = useState<"recommend" | "popularity" | "priceLow" | "priceHigh" | "rating" | "latest">("recommend");
  const [imageSearchResults, setImageSearchResults] = useState<Product[] | null>(() => {
    if (typeof window === "undefined" || searchParams.get("imageSearch") !== "stored") return null;
    try {
      const stored = sessionStorage.getItem("product-image-search-results");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return [];
    }
  });
  const [imageSearchStatus, setImageSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [hierarchicalCategories, setHierarchicalCategories] = useState<HierarchicalCategory[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
    fetch("/api/product-categories")
      .then((res) => res.json())
      .then((cats: HierarchicalCategory[]) => setHierarchicalCategories(cats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const toggle = () => setSidebarOpen((v) => !v);
    window.addEventListener("etc:toggle-product-sidebar", toggle);
    return () => window.removeEventListener("etc:toggle-product-sidebar", toggle);
  }, []);

  async function handleImageSearch(file: File) {
    setImageSearchStatus("loading");
    setImagePreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/products/search-by-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("failed");
      const results: Product[] = await res.json();
      setImageSearchResults(results);
      setImageSearchStatus("idle");
      router.push("/products?view=all#all-products");
    } catch {
      setImageSearchResults([]);
      setImageSearchStatus("error");
    }
  }

  function clearImageSearch() {
    setImageSearchResults(null);
    setImageSearchStatus("idle");
    setImagePreview(null);
  }

  const getCategoryNames = useCallback((catId: string): { ko: string; en: string } | null => {
    for (const parent of hierarchicalCategories) {
      if (parent.id === catId) return { ko: parent.nameKo, en: parent.nameEn };
      for (const child of parent.children) {
        if (child.id === catId) return { ko: child.nameKo, en: child.nameEn };
      }
    }
    return null;
  }, [hierarchicalCategories]);

  const filtered = useMemo(() => {
    if (imageSearchResults) return imageSearchResults;
    if (!products) return [];
    let list = products;
    if (activeCategory !== "all") {
      const names = getCategoryNames(activeCategory);
      if (names) {
        const parentCat = hierarchicalCategories.find((c) => c.id === activeCategory);
        if (parentCat) {
          const allNames = [
            { ko: parentCat.nameKo, en: parentCat.nameEn },
            ...parentCat.children.map((c) => ({ ko: c.nameKo, en: c.nameEn })),
          ];
          list = list.filter((p) =>
            allNames.some((n) => p.categoryKo === n.ko || p.categoryEn === n.en)
          );
        } else {
          list = list.filter(
            (p) => p.categoryKo === names.ko || p.categoryEn === names.en
          );
        }
      }
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((p) =>
        p.titleKo.toLowerCase().includes(query) ||
        p.titleEn.toLowerCase().includes(query)
      );
    }
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popularity":
          return b.popularityScore - a.popularityScore;
        case "priceLow":
          return (a.price ?? 0) - (b.price ?? 0);
        case "priceHigh":
          return (b.price ?? 0) - (a.price ?? 0);
        case "rating":
          return (b.avgRating ?? 0) - (a.avgRating ?? 0) || b.reviewCount - a.reviewCount;
        default:
          return b.popularityScore - a.popularityScore || b.reviewCount - a.reviewCount;
      }
    });
    return list;
  }, [products, activeCategory, search, sortBy, locale, imageSearchResults, hierarchicalCategories, getCategoryNames]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
    router.push("/products?view=all#all-products");
  }

  function handleSearchClear() {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const featuredProducts = products
    ? (products.some((product) => product.isFeatured)
        ? products.filter((product) => product.isFeatured)
        : products).slice(0, 6)
    : [];
  const getPageItems = (): (number | "ellipsis-left" | "ellipsis-right")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items: (number | "ellipsis-left" | "ellipsis-right")[] = [1];
    if (currentPage > 3) items.push("ellipsis-left");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage < totalPages - 2) items.push("ellipsis-right");
    items.push(totalPages);
    return items;
  };
  const pageItems = getPageItems();

  return (
    <div className={styles.shopLayout}>
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <ProductCategoryNav categories={hierarchicalCategories} locale={locale} activeCategory={activeCategory} />

        <div className={styles.sidebarContact}>
          <HeadsetIcon />
          <strong>{t.products.inquiryTitle}</strong>
          <p>{t.products.inquiryDesc}</p>
          <Link href="/contact">{t.products.inquiryBtn} →</Link>
        </div>

      </aside>

      <main className={styles.shopMain}>
        {showStorefront && (
            <StorefrontSections
              products={featuredProducts}
              locale={locale}
              searchBar={<ProductSearchBar t={t} searchInput={searchInput} setSearchInput={setSearchInput} onSubmit={handleSearchSubmit} onClear={handleSearchClear} onImageSearch={handleImageSearch} />}
            />
        )}

        <div className={`${styles.container} ${!showStorefront ? styles.catalogVisible : ""}`} id="all-products">
        {!showStorefront && <ProductSearchBar
          t={t}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSubmit={handleSearchSubmit}
          onClear={handleSearchClear}
          onImageSearch={handleImageSearch}
        />}
        {(imageSearchResults !== null || imageSearchStatus === "loading") && (
          <div className={styles.imageSearchBanner}>
            {imagePreview && <img src={imagePreview} alt="" className={styles.imageSearchThumb} />}
            <span>
              {imageSearchStatus === "loading"
                ? t.products.imageSearchLoading
                : imageSearchResults && imageSearchResults.length > 0
                  ? `${t.products.imageSearchResultsLabel} ${imageSearchResults.length}${t.products.countSuffix}`
                  : t.products.imageSearchEmpty}
            </span>
            <button type="button" onClick={clearImageSearch}>
              <CloseIcon /> {t.products.imageSearchClear}
            </button>
          </div>
        )}


        {products && filtered.length === 0 ? (
          <p className={styles.empty}>{search.trim() ? t.products.searchEmpty : t.products.empty}</p>
        ) : (
          <div className={styles.grid}>
            {pagedProducts.map((p) => {
              const category = locale === "ko" ? p.categoryKo : p.categoryEn;
              return (
                <Link key={p.id} href={`/products/${p.slug ?? p.id}`} className={styles.card}>
                  {p.images?.[0]?.url || p.thumbnailUrl ? (
                    <img className={styles.thumb} src={p.images?.[0]?.url ?? p.thumbnailUrl ?? ""} alt={locale === "ko" ? p.titleKo : p.titleEn} />
                  ) : (
                    <div className={styles.thumb} />
                  )}
                  <div className={styles.cardBody}>
                    {category && <div className={styles.cardCategory}>{category}</div>}
                    <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
                    {p.reviewCount > 0 ? (
                      <div className={styles.cardRating}>
                        <StarRatingDisplay value={p.avgRating ?? 0} size={12} />
                        <span>{(p.avgRating ?? 0).toFixed(1)}</span>
                        <span className={styles.cardRatingCount}>({p.reviewCount})</span>
                      </div>
                    ) : (
                      <div className={styles.cardRatingEmpty}>{t.products.noReviewsYet}</div>
                    )}
                    <div className={styles.cardBottom}>
                      <span className={styles.cardPrice}>{p.price ? `₩ ${p.price.toLocaleString()}` : ""}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className={styles.pagination} aria-label="Product pages">
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              ←
            </button>
            {pageItems.map((item, index) =>
              item === "ellipsis-left" ? (
                <button
                  key="ellipsis-left"
                  type="button"
                  className={styles.pageEllipsis}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 3))}
                >
                  …
                </button>
              ) : item === "ellipsis-right" ? (
                <button
                  key="ellipsis-right"
                  type="button"
                  className={styles.pageEllipsis}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 3))}
                >
                  …
                </button>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === item ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(item)}
                  aria-current={currentPage === item ? "page" : undefined}
                >
                  {item}
                </button>
              )
            )}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}

function ProductSearchBar({
  t,
  searchInput,
  setSearchInput,
  onSubmit,
  onClear,
  onImageSearch,
}: {
  t: ReturnType<typeof useLanguage>["t"];
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onClear: () => void;
  onImageSearch: (file: File) => void;
}) {
  return (
    <form className={styles.searchBar} onSubmit={onSubmit} role="search">
      <SearchIcon className={styles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={t.products.searchPlaceholder}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        aria-label={t.products.searchLabel}
      />
      {searchInput && (
        <button type="button" className={styles.searchClearBtn} onClick={onClear} aria-label={t.products.searchClear}>
          <CloseIcon />
        </button>
      )}
      <label className={styles.imageSearchBtn} aria-label={t.products.imageSearchLabel} title={t.products.imageSearchLabel}>
        <CameraIcon />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImageSearch(file);
            event.target.value = "";
          }}
        />
      </label>
      <button type="submit" className={styles.searchSubmitBtn}>{t.products.searchLabel}</button>
    </form>
  );
}

function StorefrontSections({ products, locale, searchBar }: { products: Product[]; locale: "ko" | "en"; searchBar: React.ReactNode }) {
  const reasons = [
    { icon: "gear", ko: "직접 설계·제조", en: "Direct Design & Manufacturing", koDesc: "하드웨어 설계부터 제품 제작까지 모든 과정을 직접 수행하며 최고의 품질을 보장합니다.", enDesc: "We manage the full process from hardware design to manufacturing." },
    { icon: "research", ko: "기업부설연구소", en: "Corporate R&D Center", koDesc: "지속적인 연구개발로 검증된 기술력과 혁신적인 솔루션을 제공합니다.", enDesc: "Continuous R&D delivers proven technology and innovative solutions." },
    { icon: "shield", ko: "특허 및 인증", en: "Patents & Certifications", koDesc: "다수의 특허와 인증으로 기술력과 신뢰성을 인정받았습니다.", enDesc: "Our technology and reliability are backed by patents and certifications." },
    { icon: "handshake", ko: "맞춤형 개발 (OEM/ODM)", en: "Custom OEM/ODM", koDesc: "고객 요구에 맞춘 최적의 제품과 솔루션을 신속하게 개발·공급합니다.", enDesc: "We develop optimized products and solutions for each customer." },
  ];
  const steps = [
    { number: "01", icon: "pcb", ko: "PCB 설계·제작", en: "PCB Design & Production", koDesc: "회로 설계, PCB 레이아웃, 제작 및 생산까지 고품질 PCB를 제공합니다." },
    { number: "02", icon: "cube", ko: "기구 설계·제작", en: "Mechanical Design", koDesc: "제품 구조 설계, 3D 모델링, 시제품 제작 및 금형까지 완벽한 제품을 구현합니다." },
    { number: "03", icon: "phone", ko: "소프트웨어·APP 개발", en: "Software & App Development", koDesc: "임베디드 펌웨어, 서버, 모바일 앱까지 사용자 중심의 소프트웨어를 개발합니다." },
  ];

  return (
    <div className={styles.storefrontSections}>
      <div className={styles.heroSearchWrap}>
        {searchBar}
      </div>
      <ProductHeroCarousel />
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeading}>
          <h2>{locale === "ko" ? "대표 제품군" : "Featured Products"}</h2>
          <Link href="/products?view=all#all-products">{locale === "ko" ? "전체 제품 보기" : "View all products"} →</Link>
        </div>
        <ScrollRow className={styles.featuredRail}>
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug ?? product.id}`} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                {product.images?.[0]?.url || product.thumbnailUrl ? (
                  <img src={product.images?.[0]?.url ?? product.thumbnailUrl ?? ""} alt={locale === "ko" ? product.titleKo : product.titleEn} />
                ) : null}
              </div>
              <strong>{locale === "ko" ? product.titleKo : product.titleEn}</strong>
            </Link>
          ))}
        </ScrollRow>
      </section>

      <section className={styles.whySection}>
        <div className={styles.whyIntro}>
          <small>Why ETCOMPANY</small>
          <h2>{locale === "ko" ? <>이티컴퍼니가<br />선택받는 이유</> : <>Why customers<br />choose ETCOMPANY</>}</h2>
        </div>
        {reasons.map((reason) => (
          <div className={styles.whyItem} key={reason.ko}>
            <span><StorefrontIcon type={reason.icon} /></span>
            <strong>{locale === "ko" ? reason.ko : reason.en}</strong>
            <p>{locale === "ko" ? reason.koDesc : reason.enDesc}</p>
          </div>
        ))}
      </section>

      <section className={styles.oemSection}>
        <div className={styles.oemIntro}>
          <small>OEM / ODM</small>
          <h2>{locale === "ko" ? <>고객의 아이디어를<br />최적의 제품으로</> : <>Turn your idea into<br />the ideal product</>}</h2>
          <p>{locale === "ko" ? "아이디어 구상부터 제품화까지 전문적인 기술력과 체계적인 프로세스로 완성도 높은 제품을 제공합니다." : "From concept to production, our expertise and structured process deliver complete, reliable products."}</p>
          <Link href="/contact">{locale === "ko" ? "자세히 보기" : "Learn more"} →</Link>
        </div>
        {steps.map((step) => (
          <div className={styles.oemStep} key={step.number}>
            <div className={styles.oemIcon}><StorefrontIcon type={step.icon} /></div>
            <b>{step.number}</b>
            <strong>{locale === "ko" ? step.ko : step.en}</strong>
            <p>{locale === "ko" ? step.koDesc : "Expert engineers manage every stage from design through production."}</p>
          </div>
        ))}
        <div className={styles.oemStats}>
          {[
            ["calendar", "10+", "주요 솔루션", "Key solutions"],
            ["document", "100+", "개발·공급 제품", "Products delivered"],
            ["patent", "50+", "특허 및 인증", "Patents & certificates"],
            ["network", "200+", "고객사", "Customers"],
          ].map(([icon, value, ko, en]) => (
            <div className={styles.oemStat} key={value}>
              <StorefrontIcon type={icon} />
              <div><strong>{value}</strong><span>{locale === "ko" ? ko : en}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StorefrontIcon({ type }: { type: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "gear") return <svg viewBox="0 0 24 24" {...common}><path d="M12 2.8h2.1l.7 2.5c.7.2 1.3.6 1.9 1l2.5-.7 1.1 1.8-1.8 1.9c.2.7.2 1.4 0 2.1l1.8 1.9-1.1 1.8-2.5-.7c-.6.5-1.2.8-1.9 1l-.7 2.5h-2.1l-.7-2.5c-.7-.2-1.3-.6-1.9-1l-2.5.7-1.1-1.8 1.8-1.9a7 7 0 0 1 0-2.1L5.8 7.4l1.1-1.8 2.5.7c.6-.5 1.2-.8 1.9-1z"/><circle cx="13" cy="10.4" r="3.2"/></svg>;
  if (type === "research") return <svg viewBox="0 0 24 24" {...common}><path d="m9 3 6 0M10 3v6l-4.8 8.3A2.5 2.5 0 0 0 7.4 21h9.2a2.5 2.5 0 0 0 2.2-3.7L14 9V3"/><path d="M7.3 16h9.4M9.2 13h5.6"/><circle cx="17.5" cy="6.5" r="2.5"/><path d="m19.3 8.3 2.2 2.2"/></svg>;
  if (type === "shield") return <svg viewBox="0 0 24 24" {...common}><path d="M12 2.5 20 6v5.8c0 5.1-3.2 8.2-8 9.7-4.8-1.5-8-4.6-8-9.7V6z"/><path d="m8.2 11.8 2.5 2.5 5.2-5.4"/></svg>;
  if (type === "handshake") return <svg viewBox="0 0 24 24" {...common}><path d="m3 8 4-4 4 3-5 7-4-3zM21 8l-4-4-4 3 5 7 4-3z"/><path d="m8.5 11.5 5 5a1.4 1.4 0 0 0 2-2l-3-3 3.8 3.8a1.4 1.4 0 0 0 2-2l-4.2-4.2M9.5 6.5l2.5 2 2.5-2"/><path d="m7 13 1.4 1.4M5.8 14.3l1.2 1.2"/></svg>;
  if (type === "pcb") return <svg viewBox="0 0 48 48" {...common}><rect x="5" y="7" width="38" height="32" rx="2"/><path d="M11 14h8v7h9v-7h9M11 32h7v-6h13v6h6M15 11v3M33 35v4"/><circle cx="11" cy="14" r="2"/><circle cx="37" cy="14" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="37" cy="32" r="2"/></svg>;
  if (type === "cube") return <svg viewBox="0 0 48 48" {...common}><path d="m24 4 18 10-18 10L6 14zM6 14v20l18 10 18-10V14M24 24v20"/><path d="m15 9 18 10"/></svg>;
  if (type === "phone") return <svg viewBox="0 0 48 48" {...common}><rect x="13" y="4" width="22" height="40" rx="3"/><path d="M19 9h10M21 39h6"/></svg>;
  if (type === "calendar") return <svg viewBox="0 0 48 48" {...common}><rect x="6" y="10" width="36" height="30" rx="3"/><path d="M14 5v10M34 5v10M6 19h36"/></svg>;
  if (type === "document") return <svg viewBox="0 0 48 48" {...common}><path d="M12 4h18l8 8v32H12zM30 4v9h8M18 21h14M18 28h14M18 35h10"/></svg>;
  if (type === "patent") return <svg viewBox="0 0 48 48" {...common}><path d="M8 13h32v27H8zM15 13V8h18v5"/><circle cx="24" cy="25" r="6"/><path d="m20 31-2 9 6-3 6 3-2-9"/></svg>;
  return <svg viewBox="0 0 48 48" {...common}><circle cx="24" cy="24" r="6"/><circle cx="9" cy="13" r="4"/><circle cx="39" cy="13" r="4"/><circle cx="9" cy="37" r="4"/><circle cx="39" cy="37" r="4"/><path d="m13 15 6 6M35 15l-6 6M13 35l6-6M35 35l-6-6"/></svg>;
}
