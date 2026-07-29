"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import styles from "./Header.module.css";

export function Header() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/about", label: t.nav.about },
    { href: "/business", label: t.nav.business },
    { href: "/products", label: t.nav.products },
    { href: "/rd", label: t.nav.rd },
    { href: "/portfolio", label: t.nav.portfolio },
    { href: "/promotion", label: t.nav.promotion },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <svg className={styles.logoMark} width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path
              d="M8 1L1 9L8 17M14 1L21 9L14 17"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ETCOMPANY
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.right}>
          <div className={styles.langGroup}>
            <button
              type="button"
              className={`${styles.langBtn} ${locale === "ko" ? styles.langBtnActive : ""}`}
              onClick={() => setLocale("ko")}
            >
              KR
            </button>
            <span>|</span>
            <button
              type="button"
              className={`${styles.langBtn} ${locale === "en" ? styles.langBtnActive : ""}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className={styles.langIconBtn}
            aria-label="Switch language"
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <span className={styles.langIconLabel}>{locale === "ko" ? "KR" : "EN"}</span>
          </button>

          <button
            type="button"
            className={styles.menuButton}
            aria-label="Menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className={styles.mobileNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
