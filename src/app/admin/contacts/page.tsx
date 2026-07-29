"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  in_progress: "처리중",
  done: "완료",
};

export default function AdminContactsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  async function load() {
    const res = await fetch("/api/admin/contacts");
    setInquiries(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>문의 관리</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>연락처</th>
            <th>내용</th>
            <th>상태</th>
            <th>접수일</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.email}</td>
              <td>{i.phone ?? "-"}</td>
              <td>{i.message}</td>
              <td>
                <select
                  className={styles.select}
                  value={i.status}
                  onChange={(e) => updateStatus(i.id, e.target.value)}
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{new Date(i.createdAt).toLocaleDateString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
