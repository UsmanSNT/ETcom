"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import listStyles from "../page.module.css";
import { useSiteConfig } from "@/components/useSiteConfig";

const PROMOTION_TABS = [
  { key: "press", ko: "보도자료", en: "Press Releases" },
  { key: "news", ko: "뉴스", en: "News" },
  { key: "events", ko: "전시회/행사", en: "Exhibitions / Events" },
  { key: "media", ko: "미디어", en: "Media" },
  { key: "resources", ko: "자료실", en: "Resources" },
  { key: "patents-certifications", ko: "특허·인증", en: "Patents · Certifications" },
] as const;

function PromotionCategoryIcon({ type, className }: { type: string; className?: string }) {
  if (type === "news")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M4 5h13v14H5a2 2 0 0 1-2-2V7M17 8h3v9a2 2 0 0 1-2 2M7 9h7M7 13h7M7 17h4" /></svg>;
  if (type === "events")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M3 21V8l9-4 9 4v13M3 21h18M8 21v-6h8v6M6 11h.01M12 11h.01M18 11h.01" /></svg>;
  if (type === "media")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9z" /></svg>;
  if (type === "resources")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M4 8h16v12H4zM8 4h8l2 4H6l2-4zM12 11v6M9.5 14.5 12 17l2.5-2.5" /></svg>;
  if (type === "patents-certifications")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 15l-3 3v-4.5M12 15l3 3v-4.5M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" /><path d="M5 7h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7zM9 4h6v3H9z" /></svg>;
  if (type === "all")
    return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M6 3h9l4 4v14H6zM15 3v5h5M9 12h7M9 16h7" /></svg>;
}

export default function PromotionDetailLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLanguage();
  const siteConfig = useSiteConfig();

  return (
    <div>
      <section
        className={listStyles.hero}
        style={{ backgroundImage: `url(${siteConfig.promotionHeroImage || "/images/promotion-hero.png"})` }}
      >
        <div className={listStyles.heroInner}>
          <div className={listStyles.breadcrumb}>HOME &gt; {t.promotion.breadcrumb}</div>
          <h1 className={listStyles.title}>{t.promotion.title}</h1>
          <p className={listStyles.desc}>
            {t.promotion.desc1}
            <br />
            {t.promotion.desc2}
          </p>
        </div>
      </section>

      <nav className={listStyles.tabBar}>
        <div className={listStyles.tabBarInner}>
          <Link href="/promotion" className={listStyles.tab}>
            <PromotionCategoryIcon type="all" className={listStyles.tabIcon} />
            <span>{locale === "ko" ? "전체" : "All"}</span>
          </Link>
          {PROMOTION_TABS.map((tab) => (
            <Link key={tab.key} href="/promotion" className={listStyles.tab}>
              <PromotionCategoryIcon type={tab.key} className={listStyles.tabIcon} />
              <span>{locale === "ko" ? tab.ko : tab.en}</span>
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </div>
  );
}
