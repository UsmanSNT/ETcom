"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "../ImageUploader";
import styles from "../admin.module.css";

export type ProductFormValues = {
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  images: UploadedImage[];
  categoryKo: string;
  categoryEn: string;
  price: number | null;
  isPublished: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  noIndex: boolean;
};

const EMPTY: ProductFormValues = {
  titleKo: "",
  titleEn: "",
  descriptionKo: "",
  descriptionEn: "",
  images: [],
  categoryKo: "",
  categoryEn: "",
  price: null,
  isPublished: true,
  order: 0,
  seoTitle: "",
  seoDescription: "",
  slug: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  noIndex: false,
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY,
    ...initial,
    images: initial?.images ?? [],
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    slug: initial?.slug ?? "",
    canonicalUrl: initial?.canonicalUrl ?? "",
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
  });
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
        <label className={styles.label}>썸네일 이미지</label>
        <ImageUploader value={values.images} onChange={(images) => update("images", images)} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>카테고리 (한국어)</label>
          <input className={styles.input} value={values.categoryKo} onChange={(e) => update("categoryKo", e.target.value)} placeholder="스마트팜" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>카테고리 (영어)</label>
          <input className={styles.input} value={values.categoryEn} onChange={(e) => update("categoryEn", e.target.value)} placeholder="Smart Farm" />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>가격 (원, 표시용)</label>
        <input
          className={styles.input}
          type="number"
          value={values.price ?? ""}
          onChange={(e) => update("price", e.target.value ? Number(e.target.value) : null)}
          placeholder="예: 198000"
        />
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

      <div className={styles.seoPanel}>
        <h2 className={styles.seoPanelTitle}>SEO 및 소셜 미디어 설정</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>URL slug</label>
            <input className={styles.input} value={values.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="smart-farm-controller" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Canonical URL</label>
            <input className={styles.input} value={values.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="https://example.com/products/..." />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Open Graph 제목</label>
            <input className={styles.input} value={values.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} maxLength={60} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Open Graph 설명</label>
            <input className={styles.input} value={values.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} maxLength={160} />
          </div>
        </div>
        <div className={styles.checkboxRow}>
          <input type="checkbox" id="noIndex" checked={values.noIndex} onChange={(e) => update("noIndex", e.target.checked)} />
          <label htmlFor="noIndex">검색 엔진에 노출하지 않기 (noindex)</label>
        </div>
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
