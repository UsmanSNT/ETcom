"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { PageHero } from "@/components/PageHero";
import { CoreCompetencies } from "@/components/CoreCompetencies";
import { CtaBanner } from "@/components/CtaBanner";
import styles from "./page.module.css";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHero
        breadcrumb={t.about.breadcrumb}
        label={t.about.label}
        title1={t.about.title1}
        title2={t.about.title2}
        desc1={t.about.desc1}
        desc2={t.about.desc2}
        artImage="/images/home-hero-bg.png"
      />

      <section className={styles.missionSection}>
        <div className={styles.missionInner}>
          <div className={styles.missionCol}>
            <div className={styles.missionLabel}>{t.about.missionLabel}</div>
            <div className={styles.missionTitle}>
              {t.about.missionTitle1}
              <br />
              {t.about.missionTitle2}
            </div>
            <div className={styles.missionDesc}>
              {t.about.missionDesc1}
              <br />
              {t.about.missionDesc2}
            </div>
          </div>
          <div className={styles.missionCol}>
            <div className={styles.missionLabel}>{t.about.visionLabel}</div>
            <div className={styles.missionTitle}>
              {t.about.visionTitle1}
              <br />
              {t.about.visionTitle2}
            </div>
            <div className={styles.missionDesc}>
              {t.about.visionDesc1}
              <br />
              {t.about.visionDesc2}
            </div>
          </div>
        </div>
      </section>

      <CoreCompetencies />

      <section className={styles.historySection}>
        <div className={styles.historyLabel}>{t.about.historyLabel}</div>
        <div className={styles.historyGrid}>
          <div className={styles.timeline}>
            {t.history.map((entry) => (
              <div key={entry.year} className={styles.timelineRow}>
                <div className={styles.timelineYear}>{entry.year}</div>
                <div className={styles.timelineDot}>
                  <div className={styles.timelineDotInner} />
                </div>
                <div>
                  {entry.items.map((item) => (
                    <div key={item} className={styles.timelineItem}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.mapArt}>
            <img src="/images/about-global-map.gif" alt="ETCOMPANY global network map" />
          </div>
        </div>
      </section>

      <CtaBanner
        title1={t.about.ctaTitle1}
        title2={t.about.ctaTitle2}
        btnLabel={t.about.ctaBtn}
        backgroundImage="/images/about_img-2.png"
      />
    </div>
  );
}
