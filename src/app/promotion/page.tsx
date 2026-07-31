"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Post = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  publishedAt: string;
  category: { id: string; slug: string; nameKo: string; nameEn: string };
  images: Array<{ id: string; url: string }>;
  slug: string | null;
};

type DownloadResource = {
  id: string;
  slot: string | null;
  titleKo: string;
  titleEn: string;
  fileName: string;
  mimeType: string;
  publishedAt: string;
  downloadUrl: string;
};

const RESOURCE_SLOTS = [
  { key: "product-brochure", ko: "제품 브로슈어", en: "Product Brochure", extension: "PDF" },
  { key: "serial-link-catalog", ko: "시리얼링크 카탈로그", en: "Serial Link Catalog", extension: "PDF" },
  { key: "smart-farm-guide", ko: "스마트팜 솔루션 소개서", en: "Smart Farm Solution Guide", extension: "PDF" },
  { key: "company-profile", ko: "회사소개서", en: "Company Profile", extension: "DOC" },
  { key: "technical-materials", ko: "기술자료 모음", en: "Technical Materials", extension: "XLS" },
  { key: "firmware-manual", ko: "펌웨어/매뉴얼", en: "Firmware / Manual", extension: "ZIP" },
] as const;

const PROMOTION_TABS = [
  { key: "press", ko: "보도자료", en: "Press Releases" },
  { key: "news", ko: "뉴스", en: "News" },
  { key: "events", ko: "전시회/행사", en: "Exhibitions / Events" },
  { key: "media", ko: "미디어", en: "Media" },
  { key: "resources", ko: "자료실", en: "Resources" },
] as const;

export default function PromotionPage() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [resources, setResources] = useState<DownloadResource[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/promotion/posts").then((res) => res.json()),
      fetch("/api/resources").then((res) => res.json()),
    ])
      .then(([postData, resourceData]) => {
        setPosts(postData);
        setResources(resourceData);
      })
      .catch(() => {
        setPosts([]);
        setResources([]);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (activeCategory === "all") return posts;
    const selected = PROMOTION_TABS.find((tab) => tab.key === activeCategory);
    if (!selected) return posts.filter((p) => p.category.slug === activeCategory);
    return posts.filter(
      (p) =>
        p.category.slug === selected.key ||
        p.category.nameKo === selected.ko ||
        p.category.nameEn === selected.en,
    );
  }, [posts, activeCategory]);

  const newsPosts = posts?.filter((post) => post.category.slug === "news").slice(0, 4) ?? [];
  const certificationPosts =
    posts
      ?.filter(
        (post) =>
          post.category.slug === "patents-certifications" ||
          post.category.nameKo.includes("특허") ||
          post.category.nameKo.includes("인증"),
      )
      .slice(0, 4) ?? [];

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>HOME &gt; {t.promotion.breadcrumb}</div>
          <h1 className={styles.title}>{t.promotion.title}</h1>
          <p className={styles.desc}>
            {t.promotion.desc1}
            <br />
            {t.promotion.desc2}
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeCategory === "all" ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <PromotionCategoryIcon type="all" />
            <span className={styles.tabText}>
              <strong>{t.products.all}</strong>
              <b>{posts?.length ?? 0}</b>
            </span>
          </button>
          {PROMOTION_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${activeCategory === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory(tab.key)}
            >
              <PromotionCategoryIcon type={tab.key} />
              <span className={styles.tabText}>
                <strong>{locale === "ko" ? tab.ko : tab.en}</strong>
                <b>
                  {posts?.filter(
                    (post) =>
                      post.category.slug === tab.key ||
                      post.category.nameKo === tab.ko ||
                      post.category.nameEn === tab.en,
                  ).length ?? 0}
                </b>
              </span>
            </button>
          ))}
        </div>

        {activeCategory === "all" ? (
          <div className={styles.featuredSections}>
            <PromotionList
              title={locale === "ko" ? "뉴스" : "News"}
              posts={newsPosts}
              locale={locale}
              emptyText={t.promotion.empty}
              onViewAll={() => setActiveCategory("news")}
            />
            <PromotionList
              title={locale === "ko" ? "특허 · 인증" : "Patents · Certifications"}
              posts={certificationPosts}
              locale={locale}
              emptyText={t.promotion.empty}
              onViewAll={() => setActiveCategory("patents-certifications")}
            />
          </div>
        ) : posts && filtered.length === 0 ? (
          <p className={styles.empty}>{t.promotion.empty}</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <Link key={p.id} href={`/promotion/${p.slug ?? p.id}`} className={styles.card}>
                {p.images?.[0]?.url || p.thumbnailUrl ? (
                  <img className={styles.thumb} src={p.images?.[0]?.url ?? p.thumbnailUrl ?? ""} alt={locale === "ko" ? p.titleKo : p.titleEn} />
                ) : (
                  <div className={styles.thumb} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardCategory}>{locale === "ko" ? p.category.nameKo : p.category.nameEn}</div>
                  <div className={styles.cardTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
                  <div className={styles.cardDate}>
                    {new Date(p.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <section className={styles.resourcesSection}>
          <div className={styles.resourceHeader}>
            <h2>{locale === "ko" ? "자료실" : "Resources"}</h2>
            <button type="button" onClick={() => setActiveCategory("resources")}>
              {locale === "ko" ? "전체보기" : "View all"} <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className={styles.resourceGrid}>
            {RESOURCE_SLOTS.map((slot) => {
              const resource = resources.find((item) => item.slot === slot.key);
              const extension = resource?.fileName.split(".").pop()?.toUpperCase() || slot.extension;
              const contents = (
                <>
                  <span className={styles.fileIcon}>
                    <svg viewBox="0 0 24 28" fill="none">
                      <path d="M4 1h10l6 6v20H4zM14 1v7h6" />
                    </svg>
                    <b>{extension.slice(0, 4)}</b>
                  </span>
                  <strong>
                    {resource
                      ? locale === "ko" ? resource.titleKo : resource.titleEn || resource.titleKo
                      : locale === "ko" ? slot.ko : slot.en}
                  </strong>
                  <time>{resource ? resource.publishedAt.slice(0, 10).replaceAll("-", ".") : "—"}</time>
                </>
              );
              return resource ? (
                <a className={styles.resourceCard} href={resource.downloadUrl} key={slot.key}>{contents}</a>
              ) : (
                <button
                  type="button"
                  className={`${styles.resourceCard} ${styles.resourceCardEmpty}`}
                  onClick={() => alert(locale === "ko" ? "아직 등록된 파일이 없습니다." : "No file has been uploaded yet.")}
                  key={slot.key}
                >
                  {contents}
                </button>
              );
            })}
          </div>
        </section>

        <div className={styles.newsletter}>
          <svg className={styles.newsletterIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
            <path d="m3.5 6 8.5 7 8.5-7M3.5 18l6-6M20.5 18l-6-6" />
          </svg>
          <div className={styles.newsletterTitle}>
            {t.promotion.newsletterTitle}
            <br />
            {t.promotion.newsletterTitle2}
          </div>
          <div className={styles.newsletterRow}>
            <input className={styles.newsletterInput} type="email" placeholder={t.promotion.newsletterPlaceholder} />
            <button
              className={styles.newsletterBtn}
              type="button"
              onClick={() => alert(locale === "ko" ? "뉴스레터 구독 기능을 준비 중입니다." : "Newsletter subscriptions are coming soon.")}
            >
              {t.promotion.newsletterBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionCategoryIcon({ type }: { type: string }) {
  if (type === "news") {
    return (
      <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
        <path d="M4 5h13v14H5a2 2 0 0 1-2-2V7M17 8h3v9a2 2 0 0 1-2 2M7 9h7M7 13h7M7 17h4" />
      </svg>
    );
  }
  if (type === "events") {
    return (
      <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
        <path d="M3 21V8l9-4 9 4v13M3 21h18M8 21v-6h8v6M6 11h.01M12 11h.01M18 11h.01" />
      </svg>
    );
  }
  if (type === "media") {
    return (
      <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3V9z" />
      </svg>
    );
  }
  if (type === "resources") {
    return (
      <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
        <path d="M4 8h16v12H4zM8 4h8l2 4H6l2-4zM12 11v6M9.5 14.5 12 17l2.5-2.5" />
      </svg>
    );
  }
  if (type === "all") {
    return (
      <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }
  return (
    <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h9l4 4v14H6zM15 3v5h5M9 12h7M9 16h7" />
    </svg>
  );
}

function PromotionList({
  title,
  posts,
  locale,
  emptyText,
  onViewAll,
}: {
  title: string;
  posts: Post[];
  locale: "ko" | "en";
  emptyText: string;
  onViewAll: () => void;
}) {
  return (
    <section className={styles.promotionListSection}>
      <div className={styles.listHeader}>
        <h2>{title}</h2>
        <button type="button" onClick={onViewAll}>
          {locale === "ko" ? "전체보기" : "View all"} <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className={styles.promotionList}>
        {posts.length === 0 ? (
          <p className={styles.listEmpty}>{emptyText}</p>
        ) : (
          posts.map((post) => {
            const titleText = locale === "ko" ? post.titleKo : post.titleEn;
            const content = locale === "ko" ? post.contentKo : post.contentEn;
            return (
              <Link href={`/promotion/${post.slug ?? post.id}`} className={styles.listItem} key={post.id}>
                <div className={styles.listThumb}>
                  {post.images?.[0]?.url || post.thumbnailUrl ? (
                    <img src={post.images?.[0]?.url ?? post.thumbnailUrl ?? ""} alt={titleText} />
                  ) : null}
                </div>
                <div className={styles.listBody}>
                  <span className={styles.listCategory}>
                    {locale === "ko" ? post.category.nameKo : post.category.nameEn}
                  </span>
                  <strong>{titleText}</strong>
                  {content && <p>{content.replace(/<[^>]+>/g, "").slice(0, 90)}</p>}
                  <time>{new Date(post.publishedAt).toISOString().slice(0, 10).replaceAll("-", ".")}</time>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
