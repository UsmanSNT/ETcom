"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{t.home.heroTitle}</h1>
        <p className={styles.heroSubtitle}>{t.home.heroSubtitle}</p>
        <Link href="/about" className={styles.cta}>
          {t.home.cta}
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.home.sectionAbout}</h2>
        <p className={styles.sectionDesc}>{t.home.sectionAboutDesc}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.home.sectionProducts}</h2>
        <Link href="/products" className={styles.sectionLink}>
          {t.nav.products} →
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.home.sectionPromotion}</h2>
        <Link href="/promotion" className={styles.sectionLink}>
          {t.nav.promotion} →
        </Link>
      </section>
    </div>
  );
}
