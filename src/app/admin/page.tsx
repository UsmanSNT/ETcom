"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

type Stats = {
  totalVisits: number;
  visits7d: number;
  newInquiries: number;
  totalProducts: number;
  totalPosts: number;
  recentInquiries: { id: string; name: string; email: string; message: string; createdAt: string }[];
};

const QUICK_LINKS = [
  { href: "/admin/products", title: "제품 관리", desc: "제품 정보, 썸네일, 상세 이미지를 등록하고 수정합니다.", icon: "□" },
  { href: "/admin/promotion", title: "홍보센터", desc: "뉴스, 미디어, 특허·인증 게시물을 관리합니다.", icon: "▤" },
  { href: "/admin/resources", title: "자료실", desc: "브로슈어, 카탈로그 및 매뉴얼 파일을 관리합니다.", icon: "⇩" },
  { href: "/admin/contacts", title: "문의 관리", desc: "고객 문의를 확인하고 처리 상태를 관리합니다.", icon: "✉" },
  { href: "/admin/settings", title: "사이트 설정", desc: "로고와 각 페이지의 배너 이미지를 변경합니다.", icon: "⚙" },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((res) => res.json()).then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <div className={styles.pageHeading}>
        <div><h1>대시보드</h1><p>사이트 콘텐츠와 고객 현황을 한눈에 확인하세요.</p></div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statLabel}>총 방문자</div><div className={styles.statValue}>{stats?.totalVisits ?? "-"}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>최근 7일 방문자</div><div className={styles.statValue}>{stats?.visits7d ?? "-"}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>신규 문의</div><div className={styles.statValue}>{stats?.newInquiries ?? "-"}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>등록 제품</div><div className={styles.statValue}>{stats?.totalProducts ?? "-"}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>홍보 게시물</div><div className={styles.statValue}>{stats?.totalPosts ?? "-"}</div></div>
      </div>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeading}><h2>빠른 관리</h2><p>자주 사용하는 편집 메뉴로 바로 이동합니다.</p></div>
        <div className={styles.quickGrid}>
          {QUICK_LINKS.map((item) => (
            <Link href={item.href} className={styles.quickCard} key={item.href}>
              <span>{item.icon}</span><div><strong>{item.title}</strong><p>{item.desc}</p></div><b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeading}><h2>최근 문의</h2><Link href="/admin/contacts">전체 보기 →</Link></div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>이름</th><th>이메일</th><th>문의 내용</th><th>접수일</th></tr></thead>
            <tbody>
              {stats?.recentInquiries?.length ? stats.recentInquiries.map((item) => (
                <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td>{item.message.slice(0, 55)}</td><td>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</td></tr>
              )) : <tr><td colSpan={4} className={styles.emptyCell}>최근 문의가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
