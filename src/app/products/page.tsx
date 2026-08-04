"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { CatIcon } from "./CatIcon";
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
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy] = useState<"recommend" | "popularity" | "priceLow" | "priceHigh" | "rating" | "latest">("recommend");
  const [imageSearchResults, setImageSearchResults] = useState<Product[] | null>(null);
  const [imageSearchStatus, setImageSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  function toggleExpand(catId: string) {
    setExpandedCategories((prev) => {
      if (prev.has(catId)) return new Set();
      return new Set([catId]);
    });
  }

  function getCategoryNames(catId: string): { ko: string; en: string } | null {
    for (const parent of hierarchicalCategories) {
      if (parent.id === catId) return { ko: parent.nameKo, en: parent.nameEn };
      for (const child of parent.children) {
        if (child.id === catId) return { ko: child.nameKo, en: child.nameEn };
      }
    }
    return null;
  }

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
        p.titleEn.toLowerCase().includes(query) ||
        p.descriptionKo.toLowerCase().includes(query) ||
        p.descriptionEn.toLowerCase().includes(query) ||
        (p.categoryKo?.toLowerCase().includes(query) ?? false) ||
        (p.categoryEn?.toLowerCase().includes(query) ?? false)
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
  }, [products, activeCategory, search, sortBy, locale, imageSearchResults, hierarchicalCategories]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
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
  const pageNumbers =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [1, 2, 3, totalPages];

  return (
    <div className={styles.shopLayout}>
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <nav className={styles.sidebarNav}>
          <button
            type="button"
            className={styles.sidebarAllBtn}
            onClick={() => { setActiveCategory("all"); setCurrentPage(1); setExpandedCategories(new Set()); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            {t.products.all}
          </button>
          {hierarchicalCategories.map((cat) => {
            const name = locale === "ko" ? cat.nameKo : cat.nameEn;
            const expanded = expandedCategories.has(cat.id);
            const hasChildren = cat.children.length > 0;
            const isActive = activeCategory === cat.id;
            return (
              <div key={cat.id}>
                <button
                  type="button"
                  className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setCurrentPage(1);
                    if (hasChildren) toggleExpand(cat.id);
                  }}
                >
                  <span className={styles.sidebarIcon}>
                    <CatIcon name={cat.nameEn} />
                  </span>
                  <span className={styles.sidebarItemLabel}>{name}</span>
                  {hasChildren && (
                    <span className={`${styles.sidebarItemArrow} ${expanded ? styles.sidebarItemArrowOpen : ""}`}>›</span>
                  )}
                </button>
                {hasChildren && expanded && (
                  <div className={styles.sidebarSub}>
                    {cat.children.map((sub) => {
                      const subName = locale === "ko" ? sub.nameKo : sub.nameEn;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          className={`${styles.sidebarSubItem} ${activeCategory === sub.id ? styles.sidebarSubItemActive : ""}`}
                          onClick={() => { setActiveCategory(sub.id); setCurrentPage(1); }}
                        >
                          {subName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarContact}>
          <HeadsetIcon />
          <strong>{t.products.inquiryTitle}</strong>
          <p>{t.products.inquiryDesc}</p>
          <Link href="/contact">{t.products.inquiryBtn} →</Link>
        </div>

      </aside>

      <main className={styles.shopMain}>
        <ProductHeroCarousel />

        <StorefrontSections products={featuredProducts} locale={locale} />

        <div className={styles.container} id="all-products">
        <form className={styles.searchBar} onSubmit={handleSearchSubmit} role="search">
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
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={handleSearchClear}
              aria-label={t.products.searchClear}
            >
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
                if (file) handleImageSearch(file);
                event.target.value = "";
              }}
            />
          </label>
          <button type="submit" className={styles.searchSubmitBtn}>
            {t.products.searchLabel}
          </button>
        </form>

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
            {pageNumbers.map((page, index) => (
              <span key={page} className={styles.pageGroup}>
                {index > 0 && page - pageNumbers[index - 1] > 1 && (
                  <span className={styles.pageEllipsis}>…</span>
                )}
                <button
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              </span>
            ))}
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

function StorefrontSections({ products, locale }: { products: Product[]; locale: "ko" | "en" }) {
  const reasons = [
    { icon: "⚙", ko: "직접 설계·제조", en: "Direct Design & Manufacturing", koDesc: "하드웨어 설계부터 제품 제작까지 모든 과정을 직접 수행합니다.", enDesc: "We manage the full process from hardware design to manufacturing." },
    { icon: "⌁", ko: "기업부설연구소", en: "Corporate R&D Center", koDesc: "지속적인 연구개발로 검증된 기술력과 혁신적인 솔루션을 제공합니다.", enDesc: "Continuous R&D delivers proven technology and innovative solutions." },
    { icon: "◇", ko: "특허 및 인증", en: "Patents & Certifications", koDesc: "다수의 특허와 인증으로 기술력과 신뢰성을 인정받았습니다.", enDesc: "Our technology and reliability are backed by patents and certifications." },
    { icon: "∞", ko: "맞춤형 개발 (OEM/ODM)", en: "Custom OEM/ODM", koDesc: "고객 요구에 맞춘 최적의 제품과 솔루션을 개발합니다.", enDesc: "We develop optimized products and solutions for each customer." },
  ];
  const steps = [
    { number: "01", icon: "▦", ko: "PCB 설계·제작", en: "PCB Design & Production" },
    { number: "02", icon: "◇", ko: "기구 설계·제작", en: "Mechanical Design" },
    { number: "03", icon: "▯", ko: "소프트웨어·APP 개발", en: "Software & App Development" },
  ];

  return (
    <div className={styles.storefrontSections}>
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeading}>
          <h2>{locale === "ko" ? "대표 제품군" : "Featured Products"}</h2>
          <a href="#all-products">{locale === "ko" ? "전체 제품 보기" : "View all products"} →</a>
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
            <span>{reason.icon}</span>
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
            <div className={styles.oemIcon}>{step.icon}</div>
            <b>{step.number}</b>
            <strong>{locale === "ko" ? step.ko : step.en}</strong>
            <p>{locale === "ko" ? "전문 엔지니어가 설계부터 제작까지 체계적으로 진행합니다." : "Expert engineers manage every stage from design through production."}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
