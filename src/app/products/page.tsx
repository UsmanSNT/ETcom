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
  ShieldIcon,
  TruckIcon,
  WarrantyIcon,
} from "@/components/icons/SolutionIcons";
import { ProductHeroCarousel } from "./ProductHeroCarousel";
import { ScrollRow } from "@/components/ScrollRow";
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
  createdAt: string;
};

const TRUST_ITEMS = [
  { icon: ShieldIcon, titleKey: "trust1Title", descKey: "trust1Desc" },
  { icon: TruckIcon, titleKey: "trust2Title", descKey: "trust2Desc" },
  { icon: HeadsetIcon, titleKey: "trust3Title", descKey: "trust3Desc" },
  { icon: WarrantyIcon, titleKey: "trust4Title", descKey: "trust4Desc" },
] as const;

type HierarchicalCategory = {
  id: string;
  nameKo: string;
  nameEn: string;
  children: { id: string; nameKo: string; nameEn: string }[];
};

const PAGE_SIZE = 8;

function CatIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("education") || n.includes("kit"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 17l10 6 10-6"/><path d="M2 13l10 6 10-6"/></svg>;
  if (n.includes("industrial"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 20h20"/><path d="M5 20V8l5 4V8l5 4V4h4v16"/></svg>;
  if (n.includes("iot") || n.includes("ai"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M6 10H2m4 4H2m20-4h-4m4 4h-4M10 6V2m4 0v4M10 22v-4m4 0v4"/></svg>;
  if (n.includes("innovat"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
  if (n.includes("electron") || n.includes("component"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/><circle cx="12" cy="12" r="4"/></svg>;
  if (n.includes("architect") || n.includes("diorama"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>;
  if (n.includes("lifestyle") || n.includes("other"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;
}

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recommend" | "popularity" | "priceLow" | "priceHigh" | "rating" | "latest">("recommend");
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
    setCurrentPage(1);
  }, [activeCategory, locale, search, imageSearchResults]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput);
  }

  function handleSearchClear() {
    setSearchInput("");
    setSearch("");
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
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
            onClick={() => { setActiveCategory("all"); setExpandedCategories(new Set()); }}
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
                          onClick={() => setActiveCategory(sub.id)}
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

        <div className={styles.sidebarNotice}>
          <div className={styles.noticeHeader}>
            <strong>NOTICE</strong>
            <Link href="/promotion">{t.promotion.viewAll} →</Link>
          </div>
          <Link href="/promotion">스마트팜 통합 환경 제어기 신제품 출시 <time>2026.07.15</time></Link>
          <Link href="/promotion">IoT 데이터로거 APP 업데이트 안내 <time>2026.06.30</time></Link>
          <Link href="/promotion">AFPRO 2026 전시회 참가 보고서 <time>2026.06.20</time></Link>
        </div>

        <div className={styles.customDevelopment}>
          <strong>맞춤형 개발이<br />필요하신가요?</strong>
          <p>고객의 요구에 맞춘 하드웨어 및 소프트웨어 개발 서비스를 제공합니다.</p>
          <Link href="/contact">자세히 보기 →</Link>
        </div>
      </aside>

      <main className={styles.shopMain}>
        <ProductHeroCarousel />

        <div className={styles.container}>
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

        {imageSearchResults === null && (
          <>
            <div className={styles.filterBar}>
              <div className={styles.filterCount}>
                상품 <strong>{filtered.length}</strong>개
              </div>
              <div className={styles.filterSorts}>
                {([
                  ["recommend", "추천순"],
                  ["popularity", "판매인기순"],
                  ["priceLow", "낮은가격순"],
                  ["priceHigh", "높은가격순"],
                  ["rating", "상품평순"],
                  ["latest", "등록일순"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.filterSortBtn} ${sortBy === key ? styles.filterSortBtnActive : ""}`}
                    onClick={() => setSortBy(key)}
                  >
                    {sortBy === key && <span className={styles.filterCheck}>✓</span>}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
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

        <div className={styles.trustRow}>
          {TRUST_ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className={styles.trustItem}>
              <Icon className={styles.trustIcon} />
              <div className={styles.trustTitle}>{t.products[titleKey]}</div>
              <div className={styles.trustDesc}>{t.products[descKey]}</div>
            </div>
          ))}
        </div>
        </div>
      </main>
    </div>
  );
}
