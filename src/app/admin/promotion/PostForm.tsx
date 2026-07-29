"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

type Category = { id: string; nameKo: string; nameEn: string };

export type PostFormValues = {
  categoryId: string;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  thumbnailUrl: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY: PostFormValues = {
  categoryId: "",
  titleKo: "",
  titleEn: "",
  contentKo: "",
  contentEn: "",
  thumbnailUrl: "",
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
};

export function PostForm({ postId, initial }: { postId?: string; initial?: Partial<PostFormValues> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<PostFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/promotion/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = postId ? `/api/admin/promotion/posts/${postId}` : "/api/admin/promotion/posts";
      const method = postId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.push("/admin/promotion");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>카테고리</label>
        <select className={styles.select} value={values.categoryId} onChange={(e) => update("categoryId", e.target.value)} required>
          <option value="">선택하세요</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameKo}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>제목 (한국어)</label>
          <input className={styles.input} value={values.titleKo} onChange={(e) => update("titleKo", e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>제목 (영어)</label>
          <input className={styles.input} value={values.titleEn} onChange={(e) => update("titleEn", e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>썸네일 이미지 URL</label>
        <input className={styles.input} value={values.thumbnailUrl} onChange={(e) => update("thumbnailUrl", e.target.value)} placeholder="https://..." />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>내용 (한국어)</label>
        <textarea className={styles.textarea} value={values.contentKo} onChange={(e) => update("contentKo", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>내용 (영어)</label>
        <textarea className={styles.textarea} value={values.contentEn} onChange={(e) => update("contentEn", e.target.value)} />
      </div>

      <div className={styles.checkboxRow}>
        <input type="checkbox" id="isPublished" checked={values.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />
        <label htmlFor="isPublished">공개</label>
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={saving}>
        저장
      </button>
    </form>
  );
}
