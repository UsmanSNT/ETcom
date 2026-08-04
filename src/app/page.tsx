"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  CapIcon,
  CloudIcon,
  CubeIcon,
  FactoryIcon,
  HeadsetIcon,
  LeafIcon,
  NetworkIcon,
  SensorIcon,
  SwitchIcon,
} from "@/components/icons/SolutionIcons";
import CollectDashboard from "@/components/main/CollectDashboard";
import AIAnalysisDashboard from "@/components/main/AIAnalysisDashboard";
import ControlDashboard from "@/components/main/ControlDashboard";
import styles from "./page.module.css";
import { useSiteConfig } from "@/components/useSiteConfig";

type Post = {
  id: string;
  titleKo: string;
  titleEn: string;
  publishedAt: string;
  slug?: string | null;
  category?: { slug: string; nameKo: string; nameEn: string };
  images?: Array<{ id: string; url: string }>;
  thumbnailUrl?: string | null;
};

const solutions = [
  { key: "smartFarm", icon: LeafIcon },
  { key: "industrialIot", icon: FactoryIcon },
  { key: "education", icon: CapIcon },
  { key: "platformCloud", icon: CloudIcon },
  { key: "oem", icon: CubeIcon },
] as const;

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

/** Line icons for the dashboard sidebar, one per menu item. */
const MENU_ICONS = [
  // Dashboard — grid
  <svg key="i0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  // Live Monitoring — pulse
  <svg key="i1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>,
  // Data Analysis — bar chart
  <svg key="i2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="8" width="3" height="9" /><rect x="17" y="5" width="3" height="12" /></svg>,
  // AI Prediction — sparkle
  <svg key="i3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" /></svg>,
  // Alert Management — bell
  <svg key="i4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>,
  // Settings — gear
  <svg key="i5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.2.63.77 1.07 1.51 1.09H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
];

export default function Home() {
  const { t, locale } = useLanguage();
  const siteConfig = useSiteConfig();
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
  const [posts, setPosts] = useState<Post[]>([]);
  const isCertificationPost = (post: Post) =>
    post.category?.slug === "patents-certifications" ||
    post.category?.nameKo.includes("특허") ||
    post.category?.nameKo.includes("인증") ||
    post.category?.nameEn.toLowerCase().includes("patent") ||
    post.category?.nameEn.toLowerCase().includes("certif");
  const certificationPosts = posts
    .filter(isCertificationPost)
    .filter((post) => !post.slug?.startsWith("certification-detail-"))
    .slice(0, 5);

  /* ── Dashboard animation state ── */
  const [sensorHistories, setSensorHistories] = useState<number[][]>(() =>
    SENSOR_CONFIGS.map((s) => [s.base]),
  );
  const [activeMenu, setActiveMenu] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
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
    fetch("/api/promotion/posts")
      .then((response) => response.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${siteConfig.homeHeroImage || "/images/home-bg.png"})` }}
      >
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
            <div className={styles.aiIntroLeft}>
              <p className={styles.aiLabel}>{t.home.aiExperienceLabel}</p>
              <h2 className={styles.aiTitle}>
                {t.home.aiExperienceTitle1}
                <br />
                {t.home.aiExperienceTitle2}
              </h2>
              <p className={styles.aiDesc}>{t.home.aiExperienceDesc}</p>
              <Link href="/business" className={styles.aiMore}>
                {t.home.aiMore} <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className={styles.aiSteps}>
              {[
                [SensorIcon, t.home.aiStep1Title, t.home.aiStep1Desc],
                [NetworkIcon, t.home.aiStep2Title, t.home.aiStep2Desc],
                [SwitchIcon, t.home.aiStep3Title, t.home.aiStep3Desc],
              ].map(([Icon, title, description], stepIndex) => {
                const StepIcon = Icon as typeof SensorIcon;
                return (
                  <div
                    className={`${styles.aiStep} ${activeStep === stepIndex ? styles.aiStepActive : ""}`}
                    key={String(title)}
                    onClick={() => setActiveStep(stepIndex)}
                    style={{ cursor: "pointer" }}
                  >
                    <StepIcon className={styles.aiStepIcon} />
                    <div>
                      <strong>{String(title)}</strong>
                      <p>{String(description)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <div className={`${styles.dashboardContent} ${styles.dashboardFade}`} key={activeStep}>
              {activeStep === 0 && <CollectDashboard />}
              {activeStep === 1 && <AIAnalysisDashboard />}
              {activeStep === 2 && <ControlDashboard />}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.contentSection} ${styles.newSolutionsSection}`}>
        <div className={styles.solutionsIntro}>
          <p className={styles.sectionLabel}>OUR SOLUTIONS</p>
          <h2>{locale === "ko" ? <>최적의 솔루션으로<br />더 스마트한 미래를 만듭니다.</> : <>Optimal solutions for<br />a smarter future.</>}</h2>
          <i aria-hidden="true" />
          <p>{locale === "ko" ? "이티컴퍼니의 다양한 제품과 솔루션이 고객의 가치를 높여드립니다." : "ETCOMPANY products and solutions create more value for every customer."}</p>
        </div>
        <div className={styles.newSolutionsGrid}>
          {solutions.map(({ key, icon: Icon }) => {
            const descriptions: Record<string, [string, string]> = {
              smartFarm: ["통합 환경 제어와 스마트 재배 솔루션", "Integrated control and smart cultivation"],
              industrialIot: ["실시간 모니터링과 원격 관리로 산업 현장의 효율성 향상", "Real-time monitoring for efficient operations"],
              education: ["코딩 교육과 실습을 위한 스마트 교육 솔루션", "Smart learning tools for coding education"],
              platformCloud: ["데이터 분석과 AI 기술로 더 스마트한 의사결정 지원", "Data analytics and AI-assisted decisions"],
              oem: ["고객 맞춤형 임베디드 개발·생산까지 원스톱 지원", "End-to-end custom embedded development"],
            };
            return (
              <Link href="/business" className={styles.newSolutionItem} key={key}>
                <Icon className={styles.newSolutionIcon} />
                <strong>{t.solutions[key]}</strong>
                <p>{descriptions[key]?.[locale === "ko" ? 0 : 1]}</p>
                <b aria-hidden="true">→</b>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.homeInfoBand}>
        <div className={styles.homeInfoInner}>
          <div className={styles.certColumn}>
            <p className={`${styles.sectionLabel} ${styles.certTitle}`}>CERTIFICATIONS</p>
            <div className={styles.certGrid}>
              {certificationPosts.map((cert, index) => {
                  const imageUrl = cert.images?.[0]?.url ?? cert.thumbnailUrl ?? undefined;
                  const certTitle = (locale === "ko" ? cert.titleKo : cert.titleEn)?.trim()
                    || (locale === "ko" ? cert.category?.nameKo : cert.category?.nameEn)
                    || (locale === "ko" ? "인증서" : "Certificate");
                  return (
                    <Link href={`/promotion/${cert.slug ?? cert.id}`} className={styles.certItem} key={cert.id}>
                      <div className={styles.certVisual}>
                        {imageUrl ? <img src={imageUrl} alt="" /> : index < 3 ? <span className={styles.certDocument}>CERTIFICATE</span> : <span className={styles.certSeal}>ET</span>}
                      </div>
                      <strong>{certTitle}</strong>
                    </Link>
                  );
                })}
              {certificationPosts.length === 0 && (
                <p className={styles.certEmpty}>{locale === "ko" ? "등록된 특허·인증이 없습니다." : "No patents or certifications registered."}</p>
              )}
            </div>
          </div>

          <div className={styles.contactCard}>
            <p>CONTACT US</p>
            <div className={styles.contactBody}>
              <HeadsetIcon className={styles.headsetIcon} aria-hidden="true" />
              <div>
                <strong>{t.home.contactTitle}</strong>
                <span>{t.home.contactDesc1}<br />{t.home.contactDesc2}</span>
                <Link href="/contact">{t.home.contactCta} →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
