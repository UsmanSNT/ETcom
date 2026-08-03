"use client";

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h1 className={styles.pageTitle}>대시보드</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 방문수</div>
          <div className={styles.statValue}>{stats?.totalVisits ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>방문수 (최근 7일)</div>
          <div className={styles.statValue}>{stats?.visits7d ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>신규 문의</div>
          <div className={styles.statValue}>{stats?.newInquiries ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>등록된 제품</div>
          <div className={styles.statValue}>{stats?.totalProducts ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>홍보 게시글</div>
          <div className={styles.statValue}>{stats?.totalPosts ?? "-"}</div>
        </div>
      </div>

      <h2 className={styles.pageTitle} style={{ fontSize: 18 }}>
        최근 문의
      </h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>메시지</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          {stats?.recentInquiries.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.email}</td>
              <td>{i.message.slice(0, 40)}</td>
              <td>{new Date(i.createdAt).toLocaleDateString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
