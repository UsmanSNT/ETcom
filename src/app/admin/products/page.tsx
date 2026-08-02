"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type Product = {
  id: string;
  titleKo: string;
  titleEn: string;
  isPublished: boolean;
  order: number;
};

type Category = {
  id: string;
  nameKo: string;
  nameEn: string;
  order: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ nameKo: "", nameEn: "", order: 0 });
  const [editingCat, setEditingCat] = useState<string | null>(null);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
  }

  async function loadCategories() {
    const res = await fetch("/api/admin/product-categories");
    setCategories(await res.json());
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function handleDeleteProduct(id: string) {
    if (!confirm("이 제품을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function handleSaveCategory() {
    if (!catForm.nameKo || !catForm.nameEn) return;
    if (editingCat) {
      await fetch("/api/admin/product-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCat, ...catForm }),
      });
    } else {
      await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });
    }
    setCatForm({ nameKo: "", nameEn: "", order: 0 });
    setEditingCat(null);
    loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("이 카테고리를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/product-categories?id=${id}`, { method: "DELETE" });
    loadCategories();
  }

  function startEditCategory(cat: Category) {
    setEditingCat(cat.id);
    setCatForm({ nameKo: cat.nameKo, nameEn: cat.nameEn, order: cat.order });
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>카테고리 관리</h1>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className={styles.input}
            placeholder="카테고리 (한국어)"
            value={catForm.nameKo}
            onChange={(e) => setCatForm({ ...catForm, nameKo: e.target.value })}
            style={{ flex: 1, minWidth: 140 }}
          />
          <input
            className={styles.input}
            placeholder="Category (English)"
            value={catForm.nameEn}
            onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
            style={{ flex: 1, minWidth: 140 }}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="순서"
            value={catForm.order}
            onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
            style={{ width: 70 }}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveCategory}>
            {editingCat ? "수정" : "추가"}
          </button>
          {editingCat && (
            <button
              className={styles.btn}
              onClick={() => {
                setEditingCat(null);
                setCatForm({ nameKo: "", nameEn: "", order: 0 });
              }}
            >
              취소
            </button>
          )}
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>카테고리(KO)</th>
              <th>카테고리(EN)</th>
              <th>순서</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.nameKo}</td>
                <td>{cat.nameEn}</td>
                <td>{cat.order}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btn} onClick={() => startEditCategory(cat)}>
                      수정
                    </button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteCategory(cat.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#888", padding: 20 }}>
                  등록된 카테고리가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>
          제품소개 관리
        </h1>
        <Link href="/admin/products/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          + 제품 등록
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>제목(KO)</th>
            <th>제목(EN)</th>
            <th>공개</th>
            <th>순서</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.titleKo}</td>
              <td>{p.titleEn}</td>
              <td>{p.isPublished ? "공개" : "비공개"}</td>
              <td>{p.order}</td>
              <td>
                <div className={styles.actions}>
                  <Link href={`/admin/products/${p.id}`} className={styles.btn}>
                    수정
                  </Link>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteProduct(p.id)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
