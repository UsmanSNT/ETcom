"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "../ImageUploader";
import styles from "../admin.module.css";

type CategoryOption = { id: string; nameKo: string; nameEn: string; children?: CategoryOption[] };

export type ProductFormValues = {
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  images: UploadedImage[];
  detailImages: UploadedImage[];
  categoryKo: string;
  categoryEn: string;
  categoryId: string;
  price: number | null;
  purchaseUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
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
  detailImages: [],
  categoryKo: "",
  categoryEn: "",
  categoryId: "",
  price: null,
  purchaseUrl: "",
  isPublished: true,
  isFeatured: false,
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
    detailImages: initial?.detailImages ?? [],
    categoryId: initial?.categoryId ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    slug: initial?.slug ?? "",
    canonicalUrl: initial?.canonicalUrl ?? "",
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch("/api/admin/product-categories")
      .then((r) => r.json())
      .then(setCategoryOptions)
      .catch(() => {});
  }, []);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(categoryId: string) {
    let ko = "";
    let en = "";
    for (const parent of categoryOptions) {
      if (parent.id === categoryId) { ko = parent.nameKo; en = parent.nameEn; break; }
      for (const child of parent.children ?? []) {
        if (child.id === categoryId) { ko = child.nameKo; en = child.nameEn; break; }
      }
      if (ko) break;
    }
    setValues((prev) => ({ ...prev, categoryId, categoryKo: ko, categoryEn: en }));
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
          <label className={styles.label}>Title (Korean)</label>
          <input className={styles.input} value={values.titleKo} onChange={(e) => update("titleKo", e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Title (English)</label>
          <input className={styles.input} value={values.titleEn} onChange={(e) => update("titleEn", e.target.value)} required />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Images</label>
        <ImageUploader value={values.images} onChange={(images) => update("images", images)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <select
          className={styles.input}
          value={values.categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">No category</option>
          {categoryOptions.map((parent) => (
            <optgroup key={parent.id} label={`${parent.nameKo} / ${parent.nameEn}`}>
              <option value={parent.id}>{parent.nameKo} (all)</option>
              {parent.children?.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.nameKo} / {child.nameEn}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Price (KRW, display only)</label>
        <input
          className={styles.input}
          type="number"
          value={values.price ?? ""}
          onChange={(e) => update("price", e.target.value ? Number(e.target.value) : null)}
          placeholder="e.g. 198000"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>구매 링크 (etmall.co.kr) — Purchase URL</label>
        <input
          className={styles.input}
          type="url"
          value={values.purchaseUrl}
          onChange={(e) => update("purchaseUrl", e.target.value)}
          placeholder="https://etmall.co.kr/product/..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>상세설명 이미지 / Detail Description Images (max 30)</label>
        <ImageUploader
          value={values.detailImages}
          onChange={(imgs) => update("detailImages", imgs)}
          maxImages={30}
          showPrimary={false}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description (Korean)</label>
        <textarea className={styles.textarea} value={values.descriptionKo} onChange={(e) => update("descriptionKo", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description (English)</label>
        <textarea className={styles.textarea} value={values.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>SEO Title</label>
          <input className={styles.input} value={values.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sort Order</label>
          <input
            className={styles.input}
            type="number"
            value={values.order}
            onChange={(e) => update("order", Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>SEO Description</label>
        <textarea className={styles.textarea} value={values.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
      </div>

      <div className={styles.seoPanel}>
        <h2 className={styles.seoPanelTitle}>SEO & Social Media Settings</h2>
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
            <label className={styles.label}>Open Graph Title</label>
            <input className={styles.input} value={values.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} maxLength={60} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Open Graph Description</label>
            <input className={styles.input} value={values.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} maxLength={160} />
          </div>
        </div>
        <div className={styles.checkboxRow}>
          <input type="checkbox" id="noIndex" checked={values.noIndex} onChange={(e) => update("noIndex", e.target.checked)} />
          <label htmlFor="noIndex">Hide from search engines (noindex)</label>
        </div>
      </div>

      <div className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="isFeatured"
          checked={values.isFeatured}
          onChange={(e) => update("isFeatured", e.target.checked)}
        />
        <label htmlFor="isFeatured">대표 제품으로 표시 / Featured Product</label>
      </div>

      <div className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="isPublished"
          checked={values.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)}
        />
        <label htmlFor="isPublished">Published</label>
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={saving}>
        Save
      </button>
    </form>
  );
}
