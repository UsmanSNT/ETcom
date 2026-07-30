"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "../admin.module.css";

type Resource = {
  id: string;
  slot: string | null;
  titleKo: string;
  titleEn: string;
  fileName: string;
  size: number;
  publishedAt: string;
  isPublished: boolean;
};

const RESOURCE_SLOTS = [
  ["product-brochure", "제품 브로슈어"],
  ["serial-link-catalog", "시리얼링크 카탈로그"],
  ["smart-farm-guide", "스마트팜 솔루션 소개서"],
  ["company-profile", "회사소개서"],
  ["technical-materials", "기술자료 모음"],
  ["firmware-manual", "펌웨어/매뉴얼"],
] as const;

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/resources");
    if (response.ok) setResources(await response.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const response = await fetch("/api/admin/resources", { method: "POST", body: new FormData(form) });
    setSaving(false);
    if (response.ok) {
      form.reset();
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("이 파일을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/resources?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>자료실 파일 관리</h1>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label className={styles.label}>표시 위치</label>
          <select className={styles.select} name="slot" required>
            <option value="">선택하세요</option>
            {RESOURCE_SLOTS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>파일명 (한국어)</label>
            <input className={styles.input} name="titleKo" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>파일명 (영어)</label>
            <input className={styles.input} name="titleEn" />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>게시일</label>
            <input className={styles.input} name="publishedAt" type="date" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>정렬 순서</label>
            <input className={styles.input} name="order" type="number" defaultValue="0" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>파일 (최대 20MB)</label>
          <input className={styles.input} name="file" type="file" required />
        </div>
        <input type="hidden" name="isPublished" value="true" />
        <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={saving}>
          {saving ? "업로드 중..." : "파일 등록"}
        </button>
      </form>

      <table className={styles.table} style={{ marginTop: 32 }}>
        <thead><tr><th>위치</th><th>제목</th><th>파일</th><th>게시일</th><th>크기</th><th /></tr></thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.id}>
              <td>{RESOURCE_SLOTS.find(([value]) => value === resource.slot)?.[1] ?? resource.slot}</td>
              <td>{resource.titleKo}</td>
              <td>{resource.fileName}</td>
              <td>{resource.publishedAt.slice(0, 10).replaceAll("-", ".")}</td>
              <td>{(resource.size / 1024 / 1024).toFixed(1)} MB</td>
              <td><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => remove(resource.id)}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
