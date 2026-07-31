"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import styles from "./Footer.module.css";

function AccordionSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.accordionSection} ${open ? styles.accordionOpen : ""}`}>
      <button
        type="button"
        className={styles.accordionToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <span className={styles.accordionIcon} aria-hidden="true" />
      </button>
      <div className={styles.accordionBody}>{children}</div>
    </div>
  );
}

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
            <div className={styles.partnersMarquee} aria-hidden="true">
              <div className={styles.marqueeTrack}>
                {Array.from({ length: 14 }, (_, index) => (
                  <div className={styles.partnerLogo} key={index}>
                    <img
                      src={`/images/logo_png-${(index % 7) + 1}.png`}
                      alt=""
                    />
                  </div>
                ))}
              </div>
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
              AI·플랫폼·임베디드 기술로<br />더 나은 비즈니스 환경을 만듭니다.
            </div>
            <div className={styles.socials} aria-label="Social media">
              <a className={styles.socialBtn} href="#" aria-label="YouTube">▶</a>
              <a className={styles.socialBtn} href="#" aria-label="LinkedIn">in</a>
              <a className={styles.socialBtn} href="#" aria-label="Instagram">▣</a>
              <a className={styles.socialBtn} href="#" aria-label="Blog">▦</a>
            </div>
          </div>

          <div className={styles.linkCols}>
            <AccordionSection title={t.footer.companyCol}>
              <Link className={styles.linkItem} href="/about">{t.nav.about}</Link>
              <Link className={styles.linkItem} href="/about">Vision &amp; Mission</Link>
              <Link className={styles.linkItem} href="/portfolio">{t.nav.portfolio}</Link>
              <Link className={styles.linkItem} href="/about">인증 및 수상</Link>
            </AccordionSection>

            <AccordionSection title={t.footer.solutionsCol}>
              <Link className={styles.linkItem} href="/business">{t.nav.business}</Link>
              <Link className={styles.linkItem} href="/business">스마트팜 솔루션</Link>
              <Link className={styles.linkItem} href="/business">위치추적 솔루션</Link>
              <Link className={styles.linkItem} href="/business">모니터링 솔루션</Link>
            </AccordionSection>

            <AccordionSection title="SUPPORT">
              <Link className={styles.linkItem} href="/contact">문의하기</Link>
              <span className={styles.linkItem}>자료실</span>
              <span className={styles.linkItem}>제품 매뉴얼</span>
              <span className={styles.linkItem}>FAQ</span>
            </AccordionSection>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactCardTitle}>{t.footer.contactCol}</div>
            <div className={styles.contactCardBody}>
              <div className={styles.contactInfo}>
                <div className={styles.contactRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{t.footer.address}</span>
                </div>
                <div className={styles.contactRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.65 2.36a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.28 1.55.52 2.36.65a2 2 0 0 1 1.72 2.01z" /></svg>
                  <a href={`tel:${t.footer.tel.replace(/[^0-9+-]/g, "")}`}>{t.footer.tel}</a>
                </div>
                <div className={styles.contactRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  <a href={`mailto:${t.footer.email}`}>{t.footer.email}</a>
                </div>
              </div>
              <div className={styles.contactQrSide}>
                <div className={styles.qrCode} role="img" aria-label="ETCOMPANY QR code" />
                <div className={styles.qrLabel}>회사 소개서</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div>&copy; 2026 {t.footer.companyName}. All rights reserved.</div>
          <div className={styles.bottomLinks}>
            <span>{t.footer.privacy}</span><i /><span>{t.footer.terms}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
