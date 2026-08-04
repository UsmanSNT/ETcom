"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PageHero } from "@/components/PageHero";
import { CoreCompetencies } from "@/components/CoreCompetencies";
import { CtaBanner } from "@/components/CtaBanner";
import { LeafIcon, TruckIcon, CapIcon, ChipIcon } from "@/components/icons/SolutionIcons";
import styles from "./page.module.css";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  leaf: LeafIcon,
  truck: TruckIcon,
  cap: CapIcon,
  chip: ChipIcon,
};

type AreaData = {
  id: string;
  titleKo: string;
  titleEn: string;
  itemsKo: string[];
  itemsEn: string[];
  icon: string;
  imageUrl: string | null;
};

const FALLBACK_AREAS: AreaData[] = [
  { id: "1", titleKo: "스마트팜 솔루션", titleEn: "Smart Farm Solutions", itemsKo: ["통합 환경 제어 시스템", "식물생장 LED", "식물재배 장비", "센서 및 데이터 수집"], itemsEn: ["Integrated Environment Control", "Plant Growth LED", "Cultivation Equipment", "Sensors & Data Collection"], icon: "leaf", imageUrl: null },
  { id: "2", titleKo: "산업용 IoT 솔루션", titleEn: "Industrial IoT Solutions", itemsKo: ["GPS 위치추적기", "원격 모니터링 장치", "데이터 로거", "산업용 센서 모듈"], itemsEn: ["GPS Tracker", "Remote Monitoring", "Data Logger", "Industrial Sensor Modules"], icon: "truck", imageUrl: null },
  { id: "3", titleKo: "교육 기자재 솔루션", titleEn: "Education Solutions", itemsKo: ["코딩 교구", "전자제어 실습 장비", "IoT 교육 키트", "교육용 소프트웨어"], itemsEn: ["Coding Kits", "Electronics Lab Equipment", "IoT Education Kits", "Educational Software"], icon: "cap", imageUrl: null },
  { id: "4", titleKo: "임베디드 & AI 솔루션", titleEn: "Embedded & AI Solutions", itemsKo: ["AI 모델 개발 및 경량화", "임베디드 하드웨어 설계", "IoT 플랫폼 연동", "모바일 / 웹 대시보드"], itemsEn: ["AI Model Development", "Embedded Hardware Design", "IoT Platform Integration", "Mobile / Web Dashboard"], icon: "chip", imageUrl: null },
];

type IndustryData = {
  id: string;
  titleKo: string;
  titleEn: string;
  imageUrl: string | null;
};

const INDUSTRY_ICONS: { color: string; icon: React.ReactNode }[] = [
  {
    color: "#22c55e",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56V32" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 40c-8-2-14-8-14-18 12 0 18 6 18 18" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M32 32c6-2 12-8 12-16-10 0-16 6-16 16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    color: "#3b82f6",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="20" width="28" height="20" rx="2" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M46 28h6l4 6v6h-10" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="42" r="4" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx="46" cy="42" r="4" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M28 40h14" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M8 28h10M8 24h6M8 32h4" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    color: "#475569",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 52h48" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 52V22h20v30" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M34 52V30h12v22" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="19" y="28" width="4" height="4" rx="0.5" stroke="#475569" strokeWidth="2" />
        <rect x="27" y="28" width="4" height="4" rx="0.5" stroke="#475569" strokeWidth="2" />
        <rect x="19" y="36" width="4" height="4" rx="0.5" stroke="#475569" strokeWidth="2" />
        <rect x="27" y="36" width="4" height="4" rx="0.5" stroke="#475569" strokeWidth="2" />
        <rect x="38" y="36" width="4" height="4" rx="0.5" stroke="#475569" strokeWidth="2" />
        <path d="M46 16V12h4v10" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    color: "#16a34a",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28.5 14l-16 28h12l-4 14 20-28h-14l6-14z" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M44 38c5.5-3 10-9 10-18-10 0-16 5-18 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    color: "#7c3aed",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 28l20-10 20 10" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 31v10c0 4 6 8 14 8s14-4 14-8V31" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 28v16" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="52" cy="46" r="2" fill="#7c3aed" />
      </svg>
    ),
  },
  {
    color: "#0d9488",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="28" width="16" height="24" rx="1" stroke="#0d9488" strokeWidth="2.5" />
        <rect x="26" y="16" width="16" height="36" rx="1" stroke="#0d9488" strokeWidth="2.5" />
        <rect x="42" y="24" width="12" height="28" rx="1" stroke="#0d9488" strokeWidth="2.5" />
        <path d="M15 34h6M15 40h6M31 22h6M31 28h6M31 34h6M31 40h6M47 30h4M47 36h4" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    color: "#1e3a5f",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 10l20 12v18c0 8-8 14-20 16C20 54 12 48 12 40V22l20-12z" stroke="#1e3a5f" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M24 34l6 6 12-12" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    color: "#dc2626",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="14" width="36" height="36" rx="6" stroke="#dc2626" strokeWidth="2.5" />
        <path d="M32 22v20M22 32h20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BusinessPage() {
  const { t, locale } = useLanguage();
  const [areas, setAreas] = useState<AreaData[]>(FALLBACK_AREAS);
  const [industries, setIndustries] = useState<IndustryData[] | null>(null);

  useEffect(() => {
    fetch("/api/business-areas")
      .then((res) => res.json())
      .then((data: AreaData[]) => {
        if (data.length > 0) setAreas(data);
      })
      .catch(() => {});

    fetch("/api/key-industries")
      .then((res) => res.json())
      .then((data: IndustryData[]) => {
        if (Array.isArray(data)) setIndustries(data);
      })
      .catch(() => {});
  }, []);

  // Use DB-managed industries when available; otherwise fall back to static i18n labels.
  const industryCards =
    industries && industries.length > 0
      ? industries.map((i) => ({ key: i.id, name: locale === "ko" ? i.titleKo : i.titleEn, imageUrl: i.imageUrl }))
      : t.business.industries.map((name) => ({ key: name, name, imageUrl: null as string | null }));

  return (
    <div>
      <PageHero
        breadcrumb={t.business.breadcrumb}
        label={t.business.label}
        title1={t.business.title1}
        title2={t.business.title2}
        desc1={t.business.desc1}
        desc2={t.business.desc2}
        artImage="/images/sulutions-bg-0.png"
        configKey="businessHeroImage"
      />

      <CoreCompetencies />

      <section className={styles.areasSection}>
        <div className={styles.areasInner}>
          <div className={styles.areasLabel}>{t.business.areasLabel}</div>
          <div className={styles.areasGrid}>
            {areas.map((area) => {
              const Icon = ICON_MAP[area.icon] || LeafIcon;
              const title = locale === "ko" ? area.titleKo : area.titleEn;
              const items = locale === "ko" ? area.itemsKo : area.itemsEn;
              return (
                <div key={area.id} className={styles.areaCard}>
                  {area.imageUrl ? (
                    <img src={area.imageUrl} alt={title} className={styles.areaImg} />
                  ) : (
                    <div className={styles.areaImg} />
                  )}
                  <div className={styles.areaBody}>
                    <div className={styles.areaIcon}>
                      <Icon />
                    </div>
                    <div className={styles.areaTitle}>{title}</div>
                    {items.map((item) => (
                      <div key={item} className={styles.areaItem}>
                        ✓ {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.industriesSection}>
        <div className={styles.industriesLabel}>{t.business.industriesLabel}</div>
        <div className={styles.industriesGrid}>
          {industryCards.map((industry, idx) => {
            const iconData = INDUSTRY_ICONS[idx % INDUSTRY_ICONS.length];
            return (
              <div key={industry.key} className={styles.industryCard}>
                <div className={styles.industryIconWrap}>
                  {iconData.icon}
                </div>
                <div className={styles.industryLabel}>{industry.name}</div>
                <div className={styles.industryDash} style={{ background: iconData.color }} />
              </div>
            );
          })}
        </div>
      </section>

      <CtaBanner variant="light" title1={t.business.ctaTitle} desc={t.business.ctaDesc} btnLabel={t.business.ctaBtn} />
    </div>
  );
}
