"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import styles from "./MobileBottomNav.module.css";

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
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  "/promotion": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" /><path d="M4 4l4-2h8l4 2" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  ),
  "/contact": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.65 2.36a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.28 1.55.52 2.36.65a2 2 0 0 1 1.72 2.01z" />
    </svg>
  ),
};

const IDLE_HIDE_MS = 5000;
const BOTTOM_ZONE = 80;

function useBottomNavReveal(): boolean {
  const [hidden, setHidden] = useState(true);
  const lastY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    function clearIdle() {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function scheduleIdle() {
      clearIdle();
      idleTimer.current = setTimeout(() => setHidden(true), IDLE_HIDE_MS);
    }

    function nearBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - BOTTOM_ZONE;
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (nearBottom()) {
          setHidden(false);
          clearIdle();
        } else if (delta > 4) {
          setHidden(false);
          scheduleIdle();
        } else if (delta < -4) {
          setHidden(true);
          clearIdle();
        }

        lastY.current = y;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearIdle();
    };
  }, []);

  return hidden;
}

export function MobileBottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const hidden = useBottomNavReveal();

  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/about", label: t.nav.about },
    { href: "/business", label: t.nav.business },
    { href: "/products", label: t.nav.products },
    { href: "/promotion", label: t.nav.promotion },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <nav
      className={`${styles.bottomNav} ${hidden ? styles.bottomNavHidden : ""}`}
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${active ? styles.active : ""}`}
          >
            <span className={styles.icon}>{NAV_ICONS[item.href]}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
