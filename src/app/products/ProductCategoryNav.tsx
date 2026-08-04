"use client";

import Link from "next/link";
import { useState } from "react";
import { CatIcon } from "./CatIcon";
import styles from "./page.module.css";

export type ProductNavCategory = {
  id: string;
  nameKo: string;
  nameEn: string;
  children: { id: string; nameKo: string; nameEn: string }[];
};

export function ProductCategoryNav({ categories, locale, activeCategory = "all" }: {
  categories: ProductNavCategory[];
  locale: "ko" | "en";
  activeCategory?: string;
}) {
  const activeParent = categories.find((category) =>
    category.id === activeCategory || category.children.some((child) => child.id === activeCategory),
  );
  const [expandedId, setExpandedId] = useState<string | null>(activeParent?.id ?? null);

  return (
    <nav className={styles.sidebarNav} aria-label={locale === "ko" ? "제품 카테고리" : "Product categories"}>
      <Link href="/products" className={styles.sidebarAllBtn}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        {locale === "ko" ? "전체" : "All"}
      </Link>
      {categories.map((category) => {
        const expanded = expandedId === category.id;
        return (
          <div key={category.id}>
            <div className={`${styles.sidebarItem} ${activeCategory === category.id ? styles.sidebarItemActive : ""}`}>
              <Link href={`/products?category=${encodeURIComponent(category.id)}`} className={styles.sidebarItemLink} onClick={() => setExpandedId(category.children.length ? category.id : null)}>
                <span className={styles.sidebarIcon}><CatIcon name={category.nameEn} /></span>
                <span className={styles.sidebarItemLabel}>{locale === "ko" ? category.nameKo : category.nameEn}</span>
              </Link>
              {category.children.length > 0 && (
                <button type="button" className={`${styles.sidebarItemArrow} ${expanded ? styles.sidebarItemArrowOpen : ""}`} onClick={() => setExpandedId((current) => current === category.id ? null : category.id)}>›</button>
              )}
            </div>
            {expanded && category.children.length > 0 && (
              <div className={styles.sidebarSub}>
                {category.children.map((child) => (
                  <Link key={child.id} href={`/products?category=${encodeURIComponent(child.id)}`} className={`${styles.sidebarSubItem} ${activeCategory === child.id ? styles.sidebarSubItemActive : ""}`}>
                    {locale === "ko" ? child.nameKo : child.nameEn}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
