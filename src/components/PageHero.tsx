"use client";

import { useSiteConfig } from "./useSiteConfig";
import styles from "./PageHero.module.css";

export function PageHero({
  breadcrumb,
  label,
  title1,
  title2,
  desc1,
  desc2,
  showArt = true,
  artImage,
  configKey,
}: {
  breadcrumb: string;
  label: string;
  title1: string;
  title2: string;
  desc1: string;
  desc2: string;
  showArt?: boolean;
  artImage?: string;
  configKey?: string;
}) {
  const config = useSiteConfig();
  const backgroundImage = (configKey && config[configKey]) || artImage;

  return (
    <section
      className={`${styles.hero} ${backgroundImage ? styles.heroWithBg : ""}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className={styles.inner}>
        <div>
          <div className={styles.breadcrumb}>HOME &gt; {breadcrumb}</div>
          <div className={styles.label}>{label}</div>
          <h1 className={styles.title}>
            {title1}
            <br />
            {title2}
          </h1>
          <div className={styles.divider} />
          <p className={styles.desc}>
            {desc1}
            <br />
            {desc2}
          </p>
        </div>
        {showArt && !backgroundImage && <div className={styles.art} />}
      </div>
    </section>
  );
}
