"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

const NAV_GROUPS = [
  {
    label: "개요",
    items: [{ href: "/admin", label: "대시보드", icon: "⌂" }],
  },
  {
    label: "콘텐츠 관리",
    items: [
      { href: "/admin/products", label: "제품 관리", icon: "□" },
      { href: "/admin/business", label: "사업 분야", icon: "◇" },
      { href: "/admin/key-industries", label: "주요 적용 분야", icon: "◎" },
    ],
  },
  {
    label: "홍보 관리",
    items: [
      { href: "/admin/promotion", label: "홍보센터", icon: "▤" },
      { href: "/admin/resources", label: "자료실", icon: "⇩" },
    ],
  },
  {
    label: "고객 관리",
    items: [
      { href: "/admin/contacts", label: "문의 관리", icon: "✉" },
      { href: "/admin/faq", label: "자주 묻는 질문", icon: "?" },
    ],
  },
  {
    label: "사이트 관리",
    items: [{ href: "/admin/settings", label: "로고 · 배너 · 설정", icon: "⚙" }],
  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) router.replace("/admin/login");
        else setChecked(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [isLoginPage, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isLoginPage) return <>{children}</>;
  if (!checked) return null;

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.mobileAdminHeader}>
        <strong>ETCOMPANY ADMIN</strong>
        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="관리자 메뉴 열기">☰</button>
      </header>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/admin" className={styles.brand}>
          <span>ET</span>
          <div><strong>ADMIN</strong><small>사이트 관리 시스템</small></div>
        </Link>
        <nav className={styles.adminNav} aria-label="관리자 메뉴">
          {NAV_GROUPS.map((group) => (
            <section className={styles.navGroup} key={group.label}>
              <p className={styles.navGroupLabel}>{group.label}</p>
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}>
                    <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
        <button className={styles.logout} onClick={handleLogout}>로그아웃</button>
      </aside>
      {menuOpen && <button type="button" className={styles.adminOverlay} onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" />}
      <main className={styles.content}>{children}</main>
    </div>
  );
}
