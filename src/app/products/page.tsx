"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  CartIcon,
  CubeIcon,
  GridIcon,
  HeadsetIcon,
  LeafIcon,
  LedIcon,
  NetworkIcon,
  SensorIcon,
  ShieldIcon,
  TruckIcon,
  WarrantyIcon,
} from "@/components/icons/SolutionIcons";
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
};

const TRUST_ITEMS = [
  { icon: ShieldIcon, titleKey: "trust1Title", descKey: "trust1Desc" },
  { icon: TruckIcon, titleKey: "trust2Title", descKey: "trust2Desc" },
  { icon: HeadsetIcon, titleKey: "trust3Title", descKey: "trust3Desc" },
  { icon: WarrantyIcon, titleKey: "trust4Title", descKey: "trust4Desc" },
] as const;

const SIDEBAR_CATEGORIES = [
  { ko: "스마트팜", en: "Smart Farm", icon: LeafIcon },
  { ko: "환경 센서", en: "Environmental Sensors", icon: SensorIcon },
  { ko: "모니터링 장치", en: "Monitoring Devices", icon: ShieldIcon },
  { ko: "위치추적기", en: "GPS Trackers", icon: HeadsetIcon },
  { ko: "LED", en: "LED", icon: LedIcon },
  { ko: "OEM/ODM", en: "OEM/ODM", icon: CubeIcon },
  { ko: "액세서리", en: "Accessories", icon: NetworkIcon },
] as const;

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "all") return products;
    return products.filter((p) => (locale === "ko" ? p.categoryKo : p.categoryEn) === activeCategory);
  }, [products, activeCategory, locale]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageNumbers =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [1, 2, 3, totalPages];

  return (
    <div className={styles.shopLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>SHOP</div>
        <nav className={styles.sidebarNav} aria-label="Product categories">
          <button
            type="button"
            className={`${styles.sidebarItem} ${activeCategory === "all" ? styles.sidebarItemActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <span className={styles.sidebarIcon}><GridIcon /></span>
            <span>{locale === "ko" ? "전체 제품" : "All Products"}</span>
          </button>
          {SIDEBAR_CATEGORIES.map(({ ko, en, icon: CategoryIcon }) => {
            const name = locale === "ko" ? ko : en;
            return (
              <button
                type="button"
                className={`${styles.sidebarItem} ${activeCategory === name ? styles.sidebarItemActive : ""}`}
                onClick={() => setActiveCategory(name)}
                key={name}
              >
                <span className={styles.sidebarIcon}>
                  <CategoryIcon />
                </span>
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
        <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <span>HOME</span>
            <b aria-hidden="true">›</b>
            <span>Products</span>
            <b aria-hidden="true">›</b>
            <strong>{t.products.breadcrumb}</strong>
          </div>
          <h1 className={styles.title}>{t.products.title}</h1>
          <p className={styles.desc}>
            {t.products.desc1}
            <br />
            {t.products.desc2}
          </p>
        </div>
        </section>

        <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeCategory === "all" ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              {t.products.all} ({products?.length ?? 0})
            </button>
            {SIDEBAR_CATEGORIES.slice(0, 6).map(({ ko, en }) => {
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
          </div>
          <div className={styles.sortRow}>
            <span>
              {filtered.length}
              {t.products.countSuffix}
            </span>
            <select className={styles.sortSelect} defaultValue="latest">
              <option value="latest">{t.products.sort}</option>
            </select>
          </div>
        </div>

        {products && filtered.length === 0 ? (
          <p className={styles.empty}>{t.products.empty}</p>
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
                    <div className={styles.cardBottom}>
                      <span className={styles.cardPrice}>{p.price ? `₩ ${p.price.toLocaleString()}` : ""}</span>
                      <span className={styles.cartBtn}>
                        <CartIcon width={15} height={15} />
                      </span>
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
