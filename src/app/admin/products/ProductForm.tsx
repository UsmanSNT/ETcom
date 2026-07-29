"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export type ProductFormValues = {
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  thumbnailUrl: string;
  isPublished: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY: ProductFormValues = {
  titleKo: "",
  titleEn: "",
  descriptionKo: "",
  descriptionEn: "",
  thumbnailUrl: "",
  isPublished: true,
  order: 0,
  seoTitle: "",
  seoDescription: "",
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>제목 (한국어)</label>
          <input className={styles.input} value={values.titleKo} onChange={(e) => update("titleKo", e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>제목 (영어)</label>
          <input className={styles.input} value={values.titleEn} onChange={(e) => update("titleEn", e.target.value)} required />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>썸네일 이미지 URL</label>
        <input className={styles.input} value={values.thumbnailUrl} onChange={(e) => update("thumbnailUrl", e.target.value)} placeholder="https://..." />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>상세설명 (한국어)</label>
        <textarea className={styles.textarea} value={values.descriptionKo} onChange={(e) => update("descriptionKo", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>상세설명 (영어)</label>
        <textarea className={styles.textarea} value={values.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>SEO 제목</label>
          <input className={styles.input} value={values.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>정렬 순서</label>
          <input
            className={styles.input}
            type="number"
            value={values.order}
            onChange={(e) => update("order", Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>SEO 설명</label>
        <textarea className={styles.textarea} value={values.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
      </div>

      <div className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="isPublished"
          checked={values.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)}
        />
        <label htmlFor="isPublished">공개</label>
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={saving}>
        저장
      </button>
    </form>
  );
}
