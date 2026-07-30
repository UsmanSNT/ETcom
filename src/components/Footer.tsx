"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <>
      {pathname === "/" && (
        <div className={styles.partners}>
          <div className={styles.partnersInner}>
            <div className={styles.partnersLabel}>{t.home.sectionPartners}</div>
            <div className={styles.partnersGrid}>
              {Array.from({ length: 7 }, (_, index) => (
                <div className={styles.partnerLogo} key={index}>
                  <img
                    src={`/images/logo_png-${index + 1}.png`}
                    alt={`Partner ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.brandCol}>
            <div className={styles.brandName}>
              <span className={styles.brandLogo} aria-hidden="true" />
              {t.footer.companyName}
            </div>
            <div className={styles.brandTagline}>
              {t.footer.tagline1}<br />{t.footer.tagline2}<br />{t.footer.tagline3}
            </div>
            <div className={styles.socials} aria-label="Social media">
              <span>▶</span><span>in</span><span>▣</span><span>▦</span>
            </div>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>{t.footer.companyCol}</div>
            <Link className={styles.linkItem} href="/about">{t.nav.about}</Link>
            <Link className={styles.linkItem} href="/about">Vision &amp; Mission</Link>
            <Link className={styles.linkItem} href="/portfolio">{t.nav.portfolio}</Link>
            <Link className={styles.linkItem} href="/about">인증 및 수상</Link>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>{t.footer.solutionsCol}</div>
            <Link className={styles.linkItem} href="/business">{t.nav.business}</Link>
            <Link className={styles.linkItem} href="/business">스마트팜 솔루션</Link>
            <Link className={styles.linkItem} href="/business">위치추적 솔루션</Link>
            <Link className={styles.linkItem} href="/business">모니터링 솔루션</Link>
          </div>

          <div className={styles.linkCol}>
            <div className={styles.linkColTitle}>SUPPORT</div>
            <Link className={styles.linkItem} href="/contact">문의하기</Link>
            <span className={styles.linkItem}>자료실</span>
            <span className={styles.linkItem}>제품 매뉴얼</span>
            <span className={styles.linkItem}>FAQ</span>
          </div>

          <div className={styles.contactCol}>
            <div className={styles.linkColTitle}>{t.footer.contactCol}</div>
            <span className={styles.linkItem}>⌖ {t.footer.address}</span>
            <span className={styles.linkItem}>⌕ {t.footer.tel}</span>
            <span className={styles.linkItem}>✉ {t.footer.email}</span>
          </div>

          <div className={styles.qrCode} role="img" aria-label="ETCOMPANY QR code" />
        </div>

        <div className={styles.bottom}>
          <div>&copy; 2025 {t.footer.companyName} Co., Ltd. {t.footer.rights}</div>
          <div className={styles.bottomLinks}>
            <span>{t.footer.privacy}</span><i /><span>{t.footer.terms}</span><i /><span>{t.footer.sitemap}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
