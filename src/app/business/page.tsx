"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "@/components/ContentPage.module.css";

export default function BusinessPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.business.title}</h1>
      <p className={styles.body}>{t.business.body}</p>
    </div>
  );
}
