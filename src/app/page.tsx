"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ScrollRow } from "@/components/ScrollRow";
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
  images: Array<{ id: string; url: string }>;
  slug: string | null;
};

type Post = {
  id: string;
  titleKo: string;
  titleEn: string;
  publishedAt: string;
  slug?: string | null;
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

type SensorConfig = {
  label: string;
  unit: string;
  base: number;
  min: number;
  max: number;
  decimals: number;
  format?: (v: number) => string;
};

const SENSOR_CONFIGS: SensorConfig[] = [
  { label: "온도", unit: "°C", base: 24.6, min: 23.5, max: 25.8, decimals: 1 },
  { label: "습도", unit: "%", base: 56.8, min: 52, max: 62, decimals: 1 },
  { label: "CO₂", unit: "ppm", base: 682, min: 620, max: 750, decimals: 0 },
  { label: "조도", unit: "lux", base: 12400, min: 11000, max: 14000, decimals: 0, format: (v) => Math.round(v).toLocaleString() },
];

function randomWalk(prev: number, min: number, max: number, step: number) {
  const next = prev + (Math.random() - 0.5) * step;
  return Math.min(max, Math.max(min, next));
}

function SparkLine({ history, min, max }: { history: number[]; min: number; max: number }) {
  if (history.length < 2) return null;
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const pad = 2;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x} ${y}`;
  });
  const d = `M${points.join(" L")}`;
  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/**
 * Simple statistical forecast (no external AI needed): fit a least-squares
 * trend line to the recent samples and project it forward `steps` points,
 * clamped to the sensor's valid range. This produces the "예측/forecast" curve.
 */
function forecast(history: number[], steps: number, min: number, max: number) {
  const n = history.length;
  if (n < 2) return Array.from({ length: steps }, () => history[n - 1] ?? min);
  const recent = history.slice(-5);
  const m = recent.length;
  const meanX = (m - 1) / 2;
  const meanY = recent.reduce((a, b) => a + b, 0) / m;
  let num = 0;
  let den = 0;
  for (let i = 0; i < m; i++) {
    num += (i - meanX) * (recent[i] - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const last = recent[m - 1];
  const out: number[] = [];
  for (let s = 1; s <= steps; s++) {
    out.push(Math.min(max, Math.max(min, last + slope * s)));
  }
  return out;
}

/** Build an SVG path across a combined actual+forecast series over [0,w]. */
function seriesPath(values: number[], min: number, max: number, w: number, h: number, pad = 10) {
  const range = max - min || 1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return { x, y };
  });
}

export default function Home() {
  const { t, locale } = useLanguage();
  const menuItems = [
    t.home.dashMenu1,
    t.home.dashMenu2,
    t.home.dashMenu3,
    t.home.dashMenu4,
    t.home.dashMenu5,
    t.home.dashMenu6,
  ];
  const sensorLabels = [
    t.home.sensorTemp,
    t.home.sensorHumidity,
    t.home.sensorCo2,
    t.home.sensorLux,
  ];
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  /* ── Dashboard animation state ── */
  const [sensorHistories, setSensorHistories] = useState<number[][]>(() =>
    SENSOR_CONFIGS.map((s) => [s.base]),
  );
  const [activeMenu, setActiveMenu] = useState(0);
  const [warningActive, setWarningActive] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sensor value updates every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setSensorHistories((prev) =>
        prev.map((hist, i) => {
          const cfg = SENSOR_CONFIGS[i];
          const step = (cfg.max - cfg.min) * 0.25;
          const next = randomWalk(hist[hist.length - 1], cfg.min, cfg.max, step);
          const updated = [...hist, next];
          return updated.length > 10 ? updated.slice(-10) : updated;
        }),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Warning flash every 8-10s
  useEffect(() => {
    function scheduleWarning() {
      const delay = 8000 + Math.random() * 2000;
      warningTimer.current = setTimeout(() => {
        setWarningActive(true);
        setTimeout(() => {
          setWarningActive(false);
          scheduleWarning();
        }, 2000);
      }, delay);
    }
    scheduleWarning();
    return () => {
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, []);

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
              ].map(([Icon, title, description]) => {
                const StepIcon = Icon as typeof SensorIcon;
                return (
                  <div className={styles.aiStep} key={String(title)}>
                    <StepIcon className={styles.aiStepIcon} />
                    <div>
                      <strong>
                        {String(title)}
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
            <ScrollRow as="aside" className={styles.dashboardMenu}>
              {menuItems.map((item, index) => (
                <span
                  className={index === activeMenu ? styles.menuActive : ""}
                  key={item}
                  onClick={() => setActiveMenu(index)}
                  style={{ cursor: "pointer" }}
                >
                  <i aria-hidden="true">⊙</i> {item}
                </span>
              ))}
            </ScrollRow>
            <div className={`${styles.dashboardContent} ${styles.dashboardFade}`} key={activeMenu}>
              <div className={styles.statGrid}>
                {SENSOR_CONFIGS.map((cfg, i) => {
                  const current = sensorHistories[i][sensorHistories[i].length - 1];
                  const display = cfg.format ? cfg.format(current) : current.toFixed(cfg.decimals);
                  return (
                    <div className={styles.statTile} key={cfg.label}>
                      <p>{sensorLabels[i]}</p>
                      <strong>
                        {display}
                        <small>{cfg.unit}</small>
                      </strong>
                      <SparkLine history={sensorHistories[i]} min={cfg.min} max={cfg.max} />
                    </div>
                  );
                })}
              </div>
              <div className={styles.dashboardBottom}>
                <div className={`${styles.predictionCard} ${warningActive ? styles.predictionWarning : ""}`}>
                  <p>{t.home.dashPredictTitle}</p>
                  <strong>{warningActive ? t.home.dashPredictWarnHead : t.home.dashPredictOkHead}</strong>
                  <span>{warningActive ? t.home.dashPredictWarnBody : t.home.dashPredictOkBody}</span>
                </div>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeading}>
                    <span>{t.home.dashChartTitle}</span>
                    <small>{t.home.dashChartLegend}</small>
                  </div>
                  {(() => {
                    const { min, max } = SENSOR_CONFIGS[0];
                    const actual = sensorHistories[0];
                    const predicted = forecast(actual, 4, min, max);
                    // Draw actual and forecast on one continuous x-axis so the
                    // dashed forecast visibly continues the solid trend line.
                    const combined = [...actual, ...predicted];
                    const pts = seriesPath(combined, min, max, 360, 88);
                    const join = actual.length - 1;
                    const toD = (arr: { x: number; y: number }[]) =>
                      `M${arr.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}`;
                    const actualPts = pts.slice(0, actual.length);
                    const forecastPts = pts.slice(join); // include join point for continuity
                    const nowPt = pts[join];
                    return (
                      <svg viewBox="0 0 360 88" aria-label="24시간 온도 예측 그래프">
                        <path className={styles.gridLine} d="M0 22H360M0 48H360M0 74H360" />
                        {actual.length >= 2 && <path className={styles.mainChart} d={toD(actualPts)} />}
                        <path className={styles.forecastChart} d={toD(forecastPts)} />
                        <circle cx={nowPt.x} cy={nowPt.y} r="4" />
                        <circle
                          className={styles.forecastDot}
                          cx={pts[pts.length - 1].x}
                          cy={pts[pts.length - 1].y}
                          r="3.5"
                        />
                      </svg>
                    );
                  })()}
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
                href={isProduct ? `/products/${product.slug ?? product.id}` : "/products"}
                className={styles.productCard}
                key={isProduct ? product.id : product}
              >
                <div className={styles.productVisual}>
                  {isProduct && (product.images?.[0]?.url || product.thumbnailUrl) ? (
                    <img src={product.images?.[0]?.url ?? product.thumbnailUrl ?? ""} alt={title} />
                  ) : (
                    <div
                      className={`${styles.productPhoto} ${styles[`productPhoto${index + 1}`]}`}
                      role="img"
                      aria-label={title}
                    />
                  )}
                </div>
                <div className={styles.productLabel}>
                  <span>{title}</span>
                  <b aria-hidden="true">→</b>
                </div>
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
              <Link href={posts.length ? `/promotion/${post.slug ?? post.id}` : "/promotion"} key={post.id}>
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
