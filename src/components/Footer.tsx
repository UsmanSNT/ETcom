"use client";

import { useLanguage } from "./LanguageProvider";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.name}>{t.footer.companyName}</div>
        <div className={styles.line}>{t.footer.address}</div>
        <div className={styles.line}>
          {t.footer.tel}: 02-1234-5678 &nbsp;|&nbsp; {t.footer.email}: info@newhomepage.com
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} {t.footer.companyName}. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
