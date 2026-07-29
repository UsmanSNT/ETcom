"use client";

import { useLanguage } from "@/components/LanguageProvider";
import styles from "@/components/ContentPage.module.css";

export default function RdPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.rd.title}</h1>
      <p className={styles.body}>{t.rd.body}</p>
    </div>
  );
}
