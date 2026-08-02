"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { StarRatingDisplay } from "@/components/StarRating";
import {
  CameraIcon,
  CloseIcon,
  GridIcon,
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

type CategoryInfo = { ko: string; en: string };

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "latest">("popularity");
  const [imageSearchResults, setImageSearchResults] = useState<Product[] | null>(null);
  const [imageSearchStatus, setImageSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dynamicCategories, setDynamicCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
    fetch("/api/product-categories")
      .then((res) => res.json())
      .then((cats: Array<{ nameKo: string; nameEn: string }>) =>
        setDynamicCategories(cats.map((c) => ({ ko: c.nameKo, en: c.nameEn })))
      )
      .catch(() => {});
  }, []);

  // The header's mobile burger (products page only) toggles this sidebar.
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

  const filtered = useMemo(() => {
    if (imageSearchResults) return imageSearchResults;
    if (!products) return [];
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => (locale === "ko" ? p.categoryKo : p.categoryEn) === activeCategory);
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
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.popularityScore - a.popularityScore || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    });
    return list;
  }, [products, activeCategory, search, sortBy, locale, imageSearchResults]);

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
        <nav className={styles.sidebarNav} aria-label="Product categories">
          <button
            type="button"
            className={`${styles.sidebarItem} ${activeCategory === "all" ? styles.sidebarItemActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <span className={styles.sidebarIcon}><GridIcon /></span>
            <span>{locale === "ko" ? "전체 제품" : "All Products"}</span>
          </button>
          {dynamicCategories.map(({ ko, en }) => {
            const name = locale === "ko" ? ko : en;
            return (
              <button
                type="button"
                className={`${styles.sidebarItem} ${activeCategory === name ? styles.sidebarItemActive : ""}`}
                onClick={() => setActiveCategory(name)}
                key={name}
              >
                <span>{name}</span>
                <b aria-hidden="true">›</b>
              </button>
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
          <div className={styles.toolbar}>
            <ScrollRow className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeCategory === "all" ? styles.tabActive : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                {t.products.all} ({products?.length ?? 0})
              </button>
              {dynamicCategories.map(({ ko, en }) => {
                const name = locale === "ko" ? ko : en;
                const count = products?.filter((p) => (locale === "ko" ? p.categoryKo : p.categoryEn) === name).length ?? 0;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`${styles.tab} ${activeCategory === name ? styles.tabActive : ""}`}
                    onClick={() => setActiveCategory(name)}
                  >
                    {name} ({count})
                  </button>
                );
              })}
            </ScrollRow>
            <div className={styles.sortRow}>
              <span>
                {filtered.length}
                {t.products.countSuffix}
              </span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "popularity" | "latest")}
              >
                <option value="popularity">{t.products.sortPopularity}</option>
                <option value="latest">{t.products.sort}</option>
              </select>
            </div>
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
