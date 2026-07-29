"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { LeafIcon, FactoryIcon, ChipIcon, CloudIcon, CapIcon, CubeIcon } from "@/components/icons/SolutionIcons";
import styles from "./page.module.css";

type Product = {
  id: string;
  thumbnailUrl: string | null;
  titleKo: string;
  titleEn: string;
};

type Post = {
  id: string;
  titleKo: string;
  titleEn: string;
  publishedAt: string;
};

const SOLUTION_ICONS = [LeafIcon, FactoryIcon, ChipIcon, CloudIcon, CapIcon, CubeIcon];
const SOLUTION_KEYS = ["smartFarm", "industrialIot", "embedded", "platformCloud", "education", "oem"] as const;

export default function Home() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.slice(0, 6)))
      .catch(() => setProducts([]));
    fetch("/api/promotion/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.tagline}>{t.home.tagline}</div>
          <h1 className={styles.heroTitle}>
            {t.home.heroTitle1}
            <br />
            {t.home.heroTitle2}
          </h1>
          <p className={styles.heroSubtitle}>
            {t.home.heroSubtitle1}
            <br />
            {t.home.heroSubtitle2}
          </p>
          <Link href="/business" className={styles.heroCta}>
            {t.home.cta} →
          </Link>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.heroArtShape}>
            <div className={styles.heroArtInner} />
          </div>
        </div>
      </section>

      {/* AI Experience */}
      <section className={styles.aiSection}>
        <div className={styles.aiInner}>
          <div>
            <div className={styles.aiLabel}>{t.home.aiExperienceLabel}</div>
            <h2 className={styles.aiTitle}>
              {t.home.aiExperienceTitle1}
              <br />
              {t.home.aiExperienceTitle2}
            </h2>

            <div className={styles.aiSteps}>
              <div className={styles.aiStep}>
                <ChipIcon className={styles.aiStepIcon} />
                <div>
                  <div className={styles.aiStepTitle}>{t.home.aiStep1Title}</div>
                  <div className={styles.aiStepDesc}>{t.home.aiStep1Desc}</div>
                </div>
              </div>
              <div className={styles.aiStep}>
                <CloudIcon className={styles.aiStepIcon} />
                <div>
                  <div className={styles.aiStepTitle}>{t.home.aiStep2Title}</div>
                  <div className={styles.aiStepDesc}>{t.home.aiStep2Desc}</div>
                </div>
              </div>
              <div className={styles.aiStep}>
                <CubeIcon className={styles.aiStepIcon} />
                <div>
                  <div className={styles.aiStepTitle}>{t.home.aiStep3Title}</div>
                  <div className={styles.aiStepDesc}>{t.home.aiStep3Desc}</div>
                </div>
              </div>
            </div>

            <span className={styles.aiMore}>{t.home.aiMore} →</span>
          </div>

          <div className={styles.dashboardCard}>
            <div className={styles.dashboardTabs}>
              <span className={`${styles.dashboardTab} ${styles.dashboardTabActive}`}>Dashboard</span>
              <span className={styles.dashboardTab}>Monitoring</span>
              <span className={styles.dashboardTab}>Analysis</span>
              <span className={styles.dashboardTab}>Alerts</span>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Temp</div>
                <div className={styles.statValue}>24.6°C</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Humidity</div>
                <div className={styles.statValue}>56.8%</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>CO₂</div>
                <div className={styles.statValue}>682ppm</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Light</div>
                <div className={styles.statValue}>12,400lux</div>
              </div>
            </div>
            <div className={styles.dashboardRow}>
              <div className={styles.aiResultCard}>
                <div className={styles.aiResultLabel}>AI Prediction</div>
                <div className={styles.aiResultStatus}>● Normal</div>
              </div>
              <div className={styles.chartCard}>
                <div className={styles.chartLine} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>{t.home.sectionSolutions}</div>
        </div>
        <div className={styles.solutionsGrid}>
          {SOLUTION_KEYS.map((key, i) => {
            const Icon = SOLUTION_ICONS[i];
            return (
              <Link key={key} href="/business" className={styles.solutionItem}>
                <Icon className={styles.solutionIcon} />
                <span className={styles.solutionLabel}>{t.solutions[key]} →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>{t.home.sectionProducts}</div>
          <Link href="/products" className={styles.sectionMore}>
            {t.home.productsMore} →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className={styles.emptyText}>{t.products.empty}</p>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className={styles.productCard}>
                {p.thumbnailUrl ? (
                  <img
                    className={styles.productThumb}
                    src={p.thumbnailUrl}
                    alt={locale === "ko" ? p.titleKo : p.titleEn}
                  />
                ) : (
                  <div className={styles.productThumb} />
                )}
                <div className={styles.productTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* News / Promo / Contact */}
      <section className={styles.section}>
        <div className={styles.bottomRow}>
          <div>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionLabel}>{t.home.sectionNews}</div>
              <Link href="/promotion" className={styles.sectionMore}>
                {t.home.newsMore} →
              </Link>
            </div>
            {posts.length === 0 ? (
              <p className={styles.emptyText}>{t.promotion.empty}</p>
            ) : (
              <div className={styles.newsList}>
                {posts.map((p) => (
                  <Link key={p.id} href={`/promotion/${p.id}`} className={styles.newsItem}>
                    <span className={styles.newsTitle}>{locale === "ko" ? p.titleKo : p.titleEn}</span>
                    <span className={styles.newsDate}>
                      {new Date(p.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className={styles.sectionLabel} style={{ marginBottom: 20 }}>
              {t.home.sectionPromo}
            </div>
            <div className={styles.promoCard}>
              <div className={styles.promoName}>ETCOMPANY</div>
              <div className={styles.promoTagline}>{t.home.heroTitle1} {t.home.heroTitle2}</div>
            </div>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactTitle}>{t.home.contactTitle}</div>
            <div className={styles.contactDesc}>
              {t.home.contactDesc1}
              <br />
              {t.home.contactDesc2}
            </div>
            <Link href="/contact" className={styles.contactBtn}>
              {t.home.contactCta} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
