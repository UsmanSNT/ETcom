"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { PageHero } from "@/components/PageHero";
import { CoreCompetencies } from "@/components/CoreCompetencies";
import { CtaBanner } from "@/components/CtaBanner";
import { LeafIcon, TruckIcon, CapIcon, ChipIcon, AiIcon, NetworkIcon, CloudIcon } from "@/components/icons/SolutionIcons";
import styles from "./page.module.css";

const AREA_ICONS = [LeafIcon, TruckIcon, CapIcon, ChipIcon];
const AREA_KEYS = [
  { title: "area1Title", items: "area1Items" },
  { title: "area2Title", items: "area2Items" },
  { title: "area3Title", items: "area3Items" },
  { title: "area4Title", items: "area4Items" },
] as const;

const TECH_ICONS = [AiIcon, NetworkIcon, ChipIcon, CloudIcon];
const TECH_KEYS = [
  { title: "tech1Title", desc: "tech1Desc" },
  { title: "tech2Title", desc: "tech2Desc" },
  { title: "tech3Title", desc: "tech3Desc" },
  { title: "tech4Title", desc: "tech4Desc" },
] as const;

export default function BusinessPage() {
  const { t } = useLanguage();

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
            {AREA_KEYS.map(({ title, items }, i) => {
              const Icon = AREA_ICONS[i];
              return (
                <div key={title} className={styles.areaCard}>
                  <div className={styles.areaImg} />
                  <div className={styles.areaBody}>
                    <div className={styles.areaIcon}>
                      <Icon />
                    </div>
                    <div className={styles.areaTitle}>{t.business[title]}</div>
                    {t.business[items].map((item) => (
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

      <section className={styles.techSection}>
        <div className={styles.techLabel}>{t.business.techLabel}</div>
        <div className={styles.techGrid}>
          {TECH_KEYS.map(({ title, desc }, i) => {
            const Icon = TECH_ICONS[i];
            return (
              <div key={title} className={styles.techItem}>
                <Icon className={styles.techIcon} />
                <div>
                  <div className={styles.techTitle}>{t.business[title]}</div>
                  <div className={styles.techDesc}>{t.business[desc]}</div>
                </div>
              </div>
            );
          })}
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
