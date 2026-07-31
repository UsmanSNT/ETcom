"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { BellIcon, UserIcon } from "./icons/SolutionIcons";
import styles from "./Header.module.css";
import type { ReactNode } from "react";

const REVEAL_ZONE = 96;
const IDLE_HIDE_DELAY = 1500;

const NAV_ICONS: Record<string, ReactNode> = {
  "/about": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/business": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" />
    </svg>
  ),
  "/products": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /><line x1="12" y1="15" x2="12" y2="19" /><line x1="10" y1="17" x2="14" y2="17" />
    </svg>
  ),
  "/portfolio": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="2.5" /><path d="M12 10.5v0" /><line x1="9.5" y1="16" x2="14.5" y2="16" />
    </svg>
  ),
  "/promotion": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" /><path d="M4 4l4-2h8l4 2" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="13" y2="13" /><circle cx="17" cy="19" r="3" fill="currentColor" stroke="none" /><path d="M16 18.2c.3-.4.6-.5 1-.5s.7.1 1 .5" stroke="none" fill="currentColor" />
    </svg>
  ),
  "/contact": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.65 2.36a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.28 1.55.52 2.36.65a2 2 0 0 1 1.72 2.01z" />
    </svg>
  ),
};

function useAutoHideOnScroll(disabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (disabled) {
      setHidden(false);
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isProducts = pathname.startsWith("/products");
  const hidden = useAutoHideOnScroll(open);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 100);

    function onScroll() {
      if (armed) closeMenu();
    }

    function onPointerDown(e: MouseEvent) {
      if (armed && headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown as EventListener);

    return () => {
      clearTimeout(armTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown as EventListener);
    };
  }, [open, closeMenu]);

  const navItems = [
    { href: "/about", label: t.nav.about },
    { href: "/business", label: t.nav.business },
    { href: "/products", label: t.nav.products },
    { href: "/portfolio", label: t.nav.portfolio },
    { href: "/promotion", label: t.nav.promotion },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isProducts ? styles.productsHeader : ""} ${hidden ? styles.headerHidden : ""}`}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoMark} aria-hidden="true" />
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
          {isProducts && (
            <div className={styles.productActions}>
              <button type="button" className={styles.productAction} aria-label="Notifications">
                <BellIcon />
              </button>
              <button type="button" className={styles.productAction} aria-label="Cart">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 4h2l2 11h10l2-8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1.3" fill="currentColor" />
                  <circle cx="17" cy="20" r="1.3" fill="currentColor" />
                </svg>
                <span>0</span>
              </button>
              <button type="button" className={styles.productAction} aria-label="Account">
                <UserIcon />
              </button>
            </div>
          )}

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

          <button
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Close menu" : "Menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ""}`}
                  onClick={closeMenu}
                >
                  <span className={styles.mobileNavIcon}>{NAV_ICONS[item.href]}</span>
                  <span className={styles.mobileNavLabel}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.mobileDrawerLang}>
            <button
              type="button"
              className={styles.langIconBtn}
              onClick={() => { setLocale(locale === "ko" ? "en" : "ko"); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className={styles.langIconLabel}>{locale === "ko" ? "KR" : "EN"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
