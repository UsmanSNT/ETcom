"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";

type Inquiry = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  in_progress: "처리중",
  done: "완료",
};

const TYPE_LABEL: Record<string, string> = {
  general: "일반 문의",
  product: "제품 문의",
};

export default function AdminContactsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/contacts");
    setInquiries(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      return true;
    });
  }, [inquiries, typeFilter, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      general: inquiries.filter((i) => i.type === "general").length,
      product: inquiries.filter((i) => i.type === "product").length,
    };
  }, [inquiries]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  function openReply(inquiry: Inquiry) {
    setOpenId(openId === inquiry.id ? null : inquiry.id);
    setReplyDraft(inquiry.reply ?? "");
  }

  async function saveReply(id: string) {
    setSaving(true);
    try {
      await fetch(`/api/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyDraft }),
      });
      setOpenId(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>문의 관리</h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${typeFilter === "all" ? styles.tabActive : ""}`}
          onClick={() => setTypeFilter("all")}
        >
          전체 ({counts.all})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${typeFilter === "general" ? styles.tabActive : ""}`}
          onClick={() => setTypeFilter("general")}
        >
          일반 문의 ({counts.general})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${typeFilter === "product" ? styles.tabActive : ""}`}
          onClick={() => setTypeFilter("product")}
        >
          제품 문의 ({counts.product})
        </button>
      </div>

      <div className={styles.tabs} style={{ marginTop: 8 }}>
        {["all", "new", "in_progress", "done"].map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "모든 상태" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <table className={styles.table} style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>유형</th>
            <th>이름</th>
            <th>이메일</th>
            <th>연락처</th>
            <th>내용</th>
            <th>상태</th>
            <th>접수일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((i) => (
            <Fragment key={i.id}>
              <tr>
                <td>{TYPE_LABEL[i.type] ?? i.type}</td>
                <td>{i.name}</td>
                <td>{i.email}</td>
                <td>{i.phone ?? "-"}</td>
                <td>{i.message.length > 40 ? `${i.message.slice(0, 40)}...` : i.message}</td>
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
                <td>
                  <button className={styles.btn} onClick={() => openReply(i)}>
                    {i.reply ? "답변 보기" : "답변하기"}
                  </button>
                </td>
              </tr>
              {openId === i.id && (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.card} style={{ marginBottom: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--brand-text-muted, #6b7280)", marginBottom: 8 }}>
                        문의 내용
                      </div>
                      <div style={{ fontSize: 14, marginBottom: 16, whiteSpace: "pre-wrap" }}>{i.message}</div>
                      <div className={styles.field}>
                        <label className={styles.label}>답변 작성</label>
                        <textarea
                          className={styles.textarea}
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          placeholder="고객에게 전달할 답변을 입력하세요"
                        />
                      </div>
                      {i.repliedAt && (
                        <div style={{ fontSize: 12, color: "var(--brand-text-muted, #6b7280)", marginBottom: 8 }}>
                          최종 답변일: {new Date(i.repliedAt).toLocaleString("ko-KR")}
                        </div>
                      )}
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => saveReply(i.id)}
                        disabled={saving || !replyDraft.trim()}
                      >
                        답변 저장
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
