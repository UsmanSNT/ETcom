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

export default function BusinessPage() {
  const { t, locale } = useLanguage();
  const [areas, setAreas] = useState<AreaData[]>(FALLBACK_AREAS);

  useEffect(() => {
    fetch("/api/business-areas")
      .then((res) => res.json())
      .then((data: AreaData[]) => {
        if (data.length > 0) setAreas(data);
      })
      .catch(() => {});
  }, []);

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
          {t.business.industries.map((name) => (
            <div key={name} className={styles.industryCard}>
              <div className={styles.industryImg} />
              <div className={styles.industryLabel}>{name}</div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner variant="light" title1={t.business.ctaTitle} desc={t.business.ctaDesc} btnLabel={t.business.ctaBtn} />
    </div>
  );
}
