"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import styles from "./Header.module.css";

const REVEAL_ZONE = 96;
const IDLE_HIDE_DELAY = 1500;

function useAutoHideOnScroll(disabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (disabled) {
      return;
    }

    lastScrollY.current = window.scrollY;

    function clearIdleTimer() {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function scheduleIdleHide() {
      clearIdleTimer();
      idleTimer.current = setTimeout(() => setHidden(true), IDLE_HIDE_DELAY);
    }

    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY < REVEAL_ZONE) {
          setHidden(false);
          clearIdleTimer();
        } else if (delta > 4) {
          setHidden(true);
          clearIdleTimer();
        } else if (delta < -4) {
          setHidden(false);
          scheduleIdleHide();
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearIdleTimer();
    };
  }, [disabled]);

  return hidden;
}

export function Header() {
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const isProducts = pathname.startsWith("/products");
  const hidden = useAutoHideOnScroll(false);
  const headerRef = useRef<HTMLElement>(null);
  const [navbarLogo, setNavbarLogo] = useState("");
  const [companyName, setCompanyName] = useState("ETCOMPANY");

  useEffect(() => {
    fetch("/api/site-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: Record<string, string>) => {
        setNavbarLogo(config.navbarLogo ?? "");
        if (config.companyName) setCompanyName(config.companyName);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/about", label: t.nav.about },
    { href: "/business", label: t.nav.business },
    { href: "/products", label: t.nav.products },
    { href: "/promotion", label: t.nav.promotion },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isProducts ? styles.productsHeader : ""} ${hidden ? styles.headerHidden : ""}`}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {navbarLogo ? (
            <img className={styles.customLogo} src={navbarLogo} alt={companyName} />
          ) : (
            <><span className={styles.logoMark} aria-hidden="true" />{companyName}</>
          )}
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
          {!isProducts && (
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
          )}

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

          {isProducts && (
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Toggle categories"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("etc:toggle-product-sidebar"))
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
