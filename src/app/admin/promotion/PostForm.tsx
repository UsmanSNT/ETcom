"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "../ImageUploader";
import styles from "../admin.module.css";

type Category = { id: string; nameKo: string; nameEn: string };

export type PostFormValues = {
  categoryId: string;
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  images: UploadedImage[];
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  noIndex: boolean;
};

const EMPTY: PostFormValues = {
  categoryId: "",
  titleKo: "",
  titleEn: "",
  contentKo: "",
  contentEn: "",
  images: [],
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
  slug: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  noIndex: false,
};

export function PostForm({ postId, initial }: { postId?: string; initial?: Partial<PostFormValues> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<PostFormValues>({
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
        <label className={styles.label}>썸네일 이미지</label>
        <ImageUploader value={values.images} onChange={(images) => update("images", images)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>내용 (한국어)</label>
        <textarea className={styles.textarea} value={values.contentKo} onChange={(e) => update("contentKo", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>내용 (영어)</label>
        <textarea className={styles.textarea} value={values.contentEn} onChange={(e) => update("contentEn", e.target.value)} />
      </div>

      <div className={styles.seoPanel}>
        <h2 className={styles.seoPanelTitle}>SEO 및 소셜 미디어 설정</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>SEO 제목</label>
            <input className={styles.input} value={values.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} maxLength={60} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>URL slug</label>
            <input className={styles.input} value={values.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="company-news-title" />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>SEO 설명</label>
          <textarea className={styles.textarea} value={values.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} maxLength={160} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Canonical URL</label>
            <input className={styles.input} value={values.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="https://example.com/promotion/..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Open Graph 제목</label>
            <input className={styles.input} value={values.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} maxLength={60} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Open Graph 설명</label>
          <input className={styles.input} value={values.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} maxLength={160} />
        </div>
        <div className={styles.checkboxRow}>
          <input type="checkbox" id="noIndex" checked={values.noIndex} onChange={(e) => update("noIndex", e.target.checked)} />
          <label htmlFor="noIndex">검색 엔진에 노출하지 않기 (noindex)</label>
        </div>
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
