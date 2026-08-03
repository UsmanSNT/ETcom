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
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Visits</div>
          <div className={styles.statValue}>{stats?.totalVisits ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Visits (Last 7 Days)</div>
          <div className={styles.statValue}>{stats?.visits7d ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>New Inquiries</div>
          <div className={styles.statValue}>{stats?.newInquiries ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Registered Products</div>
          <div className={styles.statValue}>{stats?.totalProducts ?? "-"}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Promotion Posts</div>
          <div className={styles.statValue}>{stats?.totalPosts ?? "-"}</div>
        </div>
      </div>

      <h2 className={styles.pageTitle} style={{ fontSize: 18 }}>
        Recent Inquiries
      </h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {stats?.recentInquiries.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.email}</td>
              <td>{i.message.slice(0, 40)}</td>
              <td>{new Date(i.createdAt).toLocaleDateString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
