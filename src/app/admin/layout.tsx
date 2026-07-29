"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "제품소개 관리" },
  { href: "/admin/promotion", label: "홍보센터 관리" },
  { href: "/admin/contacts", label: "문의 관리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin/login");
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!checked) {
    return null;
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>ADMIN</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <button className={styles.logout} onClick={handleLogout}>
          로그아웃
        </button>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
