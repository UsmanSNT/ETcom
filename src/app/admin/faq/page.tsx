"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type FaqItem = {
  id: string;
  questionKo: string;
  questionEn: string;
  answerKo: string;
  answerEn: string;
  order: number;
  isPublished: boolean;
};

const emptyForm = (): Omit<FaqItem, "id"> & { id?: string } => ({
  questionKo: "",
  questionEn: "",
  answerKo: "",
  answerEn: "",
  order: 0,
  isPublished: true,
});

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/faq");
    if (res.ok) setFaqs(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(faq: FaqItem) {
    setForm({ ...faq });
    setEditing(true);
  }

  function startNew() {
    setForm(emptyForm());
    setEditing(true);
  }

  function cancel() {
    setForm(emptyForm());
    setEditing(false);
  }

  async function handleSave() {
    if (!form.questionKo || !form.questionEn) return;
    setSaving(true);
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/admin/faq", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    setForm(emptyForm());
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 FAQ 항목을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>자주 묻는 질문 관리</h1>
        {!editing && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startNew}>+ 신규 등록</button>
        )}
      </div>

      {editing && (
        <div className={styles.card}>
          <div className={styles.form}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{form.id ? "FAQ 수정" : "신규 등록"}</h2>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>질문 (한국어)</label>
                <input className={styles.input} value={form.questionKo} onChange={(e) => setForm({ ...form, questionKo: e.target.value })} placeholder="제품 구매는 어떻게 진행되나요?" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>질문 (영어)</label>
                <input className={styles.input} value={form.questionEn} onChange={(e) => setForm({ ...form, questionEn: e.target.value })} placeholder="How does the purchase process work?" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>답변 (한국어)</label>
                <textarea className={styles.textarea} value={form.answerKo} onChange={(e) => setForm({ ...form, answerKo: e.target.value })} placeholder="답변을 입력하세요" rows={3} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>답변 (영어)</label>
                <textarea className={styles.textarea} value={form.answerEn} onChange={(e) => setForm({ ...form, answerEn: e.target.value })} placeholder="Enter the answer" rows={3} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>정렬 순서</label>
              <input className={styles.input} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} style={{ maxWidth: 120 }} />
            </div>

            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              <label className={styles.label}>공개</label>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
                {saving ? "저장 중..." : form.id ? "변경 사항 저장" : "등록"}
              </button>
              <button className={styles.btn} onClick={cancel}>취소</button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>순서</th>
            <th>질문(KO)</th>
            <th>질문(EN)</th>
            <th>공개</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq.id}>
              <td>{faq.order}</td>
              <td>{faq.questionKo}</td>
              <td>{faq.questionEn}</td>
              <td>{faq.isPublished ? "✓" : "—"}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btn} onClick={() => startEdit(faq)}>수정</button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(faq.id)}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
          {faqs.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, opacity: 0.5 }}>등록된 FAQ가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
