"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import styles from "./Header.module.css";

export function Header() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/about", label: t.nav.about },
    { href: "/business", label: t.nav.business },
    { href: "/products", label: t.nav.products },
    { href: "/promotion", label: t.nav.promotion },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          NEW HOMEPAGE
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.langButton}
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
          >
            {locale === "ko" ? "EN" : "KO"}
          </button>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
