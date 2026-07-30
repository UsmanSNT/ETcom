"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  CapIcon,
  ChipIcon,
  CloudIcon,
  CubeIcon,
  FactoryIcon,
  HeadsetIcon,
  LeafIcon,
  NetworkIcon,
  PlayIcon,
  SensorIcon,
  SwitchIcon,
} from "@/components/icons/SolutionIcons";
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

const solutions = [
  { key: "smartFarm", icon: LeafIcon },
  { key: "industrialIot", icon: FactoryIcon },
  { key: "embedded", icon: ChipIcon },
  { key: "platformCloud", icon: CloudIcon },
  { key: "education", icon: CapIcon },
  { key: "oem", icon: CubeIcon },
] as const;

const fallbackProducts = [
  "스마트팜 통합 제어 시스템",
  "GPS 위치추적기",
  "원격 모니터링 장치",
  "센서 및 계측기",
  "식물재배 장비",
  "식물성장 LED",
];

const readings = [
  { label: "온도", value: "24.6", unit: "°C" },
  { label: "습도", value: "56.8", unit: "%" },
  { label: "CO₂", value: "682", unit: "ppm" },
  { label: "조도", value: "12,400", unit: "lux" },
];

function TrendLine() {
  return (
    <svg className={styles.sparkline} viewBox="0 0 120 28" aria-hidden="true">
      <path d="M0 22 13 15 25 20 39 9 53 17 68 7 82 15 98 6 110 11 120 4" />
    </svg>
  );
}

export default function Home() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setProducts([]));
    fetch("/api/promotion/posts")
      .then((response) => response.json())
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.tagline}>{t.home.tagline}</p>
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
            <Link href="/business" className={styles.textLink}>
              {t.home.cta} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className={styles.aiInner}>
          <div className={styles.aiIntro}>
            <div>
              <p className={styles.aiLabel}>{t.home.aiExperienceLabel}</p>
              <h2 className={styles.aiTitle}>
                {t.home.aiExperienceTitle1}
                <br />
                {t.home.aiExperienceTitle2}
              </h2>
            </div>

            <div className={styles.aiSteps}>
              {[
                [SensorIcon, t.home.aiStep1Title, t.home.aiStep1Desc],
                [NetworkIcon, t.home.aiStep2Title, t.home.aiStep2Desc],
                [SwitchIcon, t.home.aiStep3Title, t.home.aiStep3Desc],
              ].map(([Icon, title, description], index) => {
                const StepIcon = Icon as typeof SensorIcon;
                return (
                  <div className={styles.aiStep} key={String(title)}>
                    <StepIcon className={styles.aiStepIcon} />
                    <div>
                      <strong>
                        {String(index + 1).padStart(2, "0")}. {String(title)}
                      </strong>
                      <p>{String(description)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/business" className={styles.aiMore}>
              {t.home.aiMore} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.dashboardCard}>
            <aside className={styles.dashboardMenu}>
              {["대시보드", "실시간 모니터링", "데이터 분석", "AI 예측", "알림 관리", "설정"].map(
                (item, index) => (
                  <span className={index === 0 ? styles.menuActive : ""} key={item}>
                    <i aria-hidden="true">⊙</i> {item}
                  </span>
                ),
              )}
            </aside>
            <div className={styles.dashboardContent}>
              <div className={styles.statGrid}>
                {readings.map((reading) => (
                  <div className={styles.statTile} key={reading.label}>
                    <p>{reading.label}</p>
                    <strong>
                      {reading.value}
                      <small>{reading.unit}</small>
                    </strong>
                    <TrendLine />
                  </div>
                ))}
              </div>
              <div className={styles.dashboardBottom}>
                <div className={styles.predictionCard}>
                  <p>AI 예측 결과</p>
                  <strong>＋ 이상 없음</strong>
                  <span>모든 환경이 정상 범위입니다.</span>
                </div>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeading}>
                    <span>온도 예측 (24시간)</span>
                    <small>— 예측 · 실제</small>
                  </div>
                  <svg viewBox="0 0 360 88" aria-label="24시간 온도 예측 그래프">
                    <path className={styles.gridLine} d="M0 22H360M0 48H360M0 74H360" />
                    <path className={styles.mainChart} d="M0 60C30 76 42 18 80 31S125 59 160 55 204 26 240 42 290 68 360 44" />
                    <circle cx="240" cy="42" r="4" />
                  </svg>
                  <div className={styles.chartTimes}>
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <p className={styles.sectionLabel}>{t.home.sectionSolutions}</p>
        <div className={styles.solutionsGrid}>
          {solutions.map(({ key, icon: Icon }) => (
            <Link href="/business" className={styles.solutionItem} key={key}>
              <Icon className={styles.solutionIcon} />
              <span>{t.solutions[key]}</span>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{t.home.sectionProducts}</p>
          <Link href="/products">{t.home.productsMore} →</Link>
        </div>
        <div className={styles.productsGrid}>
          {(products.length ? products : fallbackProducts).map((product, index) => {
            const isProduct = typeof product !== "string";
            const title = isProduct
              ? locale === "ko" ? product.titleKo : product.titleEn
              : product;
            return (
              <Link
                href={isProduct ? `/products/${product.id}` : "/products"}
                className={styles.productCard}
                key={isProduct ? product.id : product}
              >
                <div className={styles.productVisual}>
                  {isProduct && product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={title} />
                  ) : (
                    <div
                      className={`${styles.productPhoto} ${styles[`productPhoto${index + 1}`]}`}
                      role="img"
                      aria-label={title}
                    />
                  )}
                </div>
                <span>{title}</span><b aria-hidden="true">→</b>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={`${styles.contentSection} ${styles.bottomSection}`}>
        <div className={styles.newsColumn}>
          <p className={styles.sectionLabel}>{t.home.sectionNews}</p>
          <div className={styles.newsList}>
            {(posts.length ? posts : [
              { id: "1", titleKo: "AFFRO 2026 전시회 참가 보고서", titleEn: "AFFRO 2026 Exhibition Report", publishedAt: "2026-07-29" },
              { id: "2", titleKo: "스마트팜 통합 환경 제어기 신제품 출시", titleEn: "New Smart Farm Controller", publishedAt: "2026-07-15" },
              { id: "3", titleKo: "IoT 데이터로거 시리얼링크 APP 업데이트 안내", titleEn: "IoT Datalogger App Update", publishedAt: "2026-06-30" },
            ]).map((post) => (
              <Link href={posts.length ? `/promotion/${post.id}` : "/promotion"} key={post.id}>
                <span>{locale === "ko" ? post.titleKo : post.titleEn}</span>
                <time>{new Date(post.publishedAt).toISOString().slice(0, 10).replaceAll("-", ".")}</time>
              </Link>
            ))}
          </div>
          <Link href="/promotion" className={styles.inlineMore}>{t.home.newsMore} →</Link>
        </div>

        <div className={styles.promoColumn}>
          <p className={styles.sectionLabel}>{t.home.sectionPromo}</p>
          <div className={styles.promoGrid}>
            <div className={styles.promoMain}>
              <strong>ET<span>COMPANY</span></strong>
              <small>Smart Solution, Better Future</small>
              <i><PlayIcon /></i>
            </div>
            <div className={styles.promoThumb}><PlayIcon /></div>
            <div className={styles.promoThumb}><PlayIcon /></div>
          </div>
        </div>

        <div className={styles.contactCard}>
          <p>CONTACT US</p>
          <HeadsetIcon className={styles.headsetIcon} aria-hidden="true" />
          <strong>{t.home.contactTitle}</strong>
          <span>{t.home.contactDesc1}<br />{t.home.contactDesc2}</span>
          <Link href="/contact">{t.home.contactCta} →</Link>
        </div>
      </section>
    </div>
  );
}
