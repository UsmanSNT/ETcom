"use client";

import { useLanguage } from "./LanguageProvider";
import styles from "./Footer.module.css";

const PARTNERS = ["SAMSUNG", "RAINBOW ROBOTICS", "LS ELECTRIC", "K water", "HYUNDAI", "농촌진흥청", "전라북도"];

export function Footer() {
  const { t } = useLanguage();

  return (
    <>
      <div className={styles.partners}>
        <div className={styles.partnersInner}>
          <div className={styles.partnersLabel}>{t.home.sectionPartners}</div>
          <div className={styles.partnersRow}>
            {PARTNERS.map((name) => (
              <span key={name} className={styles.partnerName}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.brandCol}>
            <div className={styles.brandName}>
              <svg width="20" height="16" viewBox="0 0 22 18" fill="none">
                <path
                  d="M8 1L1 9L8 17M14 1L21 9L14 17"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t.footer.companyName}
            </div>
            <div className={styles.brandTagline}>
              {t.footer.tagline1}
              <br />
              {t.footer.tagline2}
              <br />
              {t.footer.tagline3}
            </div>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>{t.footer.companyCol}</div>
            <span className={styles.linkItem}>{t.nav.about}</span>
            <span className={styles.linkItem}>{t.nav.rd}</span>
            <span className={styles.linkItem}>{t.nav.portfolio}</span>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>{t.footer.solutionsCol}</div>
            <span className={styles.linkItem}>{t.nav.business}</span>
            <span className={styles.linkItem}>{t.nav.products}</span>
            <span className={styles.linkItem}>{t.nav.promotion}</span>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>{t.footer.contactCol}</div>
            <span className={styles.linkItem}>{t.footer.address}</span>
            <span className={styles.linkItem}>{t.footer.tel}</span>
            <span className={styles.linkItem}>{t.footer.email}</span>
          </div>
        </div>

        <div className={styles.bottom}>
          <div>
            &copy; {new Date().getFullYear()} {t.footer.companyName}. {t.footer.rights}
          </div>
          <div className={styles.bottomLinks}>
            <span>{t.footer.privacy}</span>
            <span>{t.footer.terms}</span>
            <span>{t.footer.sitemap}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
