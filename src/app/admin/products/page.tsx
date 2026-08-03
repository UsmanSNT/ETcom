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
  children: Category[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ nameKo: "", nameEn: "", order: 0, parentId: "" });
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
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function handleSaveCategory() {
    if (!catForm.nameKo || !catForm.nameEn) return;
    if (editingCat) {
      await fetch("/api/admin/product-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCat, nameKo: catForm.nameKo, nameEn: catForm.nameEn, order: catForm.order }),
      });
    } else {
      await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });
    }
    setCatForm({ nameKo: "", nameEn: "", order: 0, parentId: "" });
    setEditingCat(null);
    loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? All subcategories will also be deleted.")) return;
    await fetch(`/api/admin/product-categories?id=${id}`, { method: "DELETE" });
    loadCategories();
  }

  function startEditCategory(cat: Category) {
    setEditingCat(cat.id);
    setCatForm({ nameKo: cat.nameKo, nameEn: cat.nameEn, order: cat.order, parentId: "" });
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Category Management</h1>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className={styles.input}
            placeholder="Category (Korean)"
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
            placeholder="Order"
            value={catForm.order}
            onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
            style={{ width: 70 }}
          />
          {!editingCat && (
            <select
              className={styles.input}
              value={catForm.parentId}
              onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
              style={{ minWidth: 160 }}
            >
              <option value="">Top-level category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameKo} / {c.nameEn}</option>
              ))}
            </select>
          )}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveCategory}>
            {editingCat ? "Save" : "Add"}
          </button>
          {editingCat && (
            <button
              className={styles.btn}
              onClick={() => {
                setEditingCat(null);
                setCatForm({ nameKo: "", nameEn: "", order: 0, parentId: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category (KO)</th>
              <th>Category (EN)</th>
              <th>Order</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <>
                <tr key={cat.id}>
                  <td style={{ fontWeight: 700 }}>{cat.nameKo}</td>
                  <td style={{ fontWeight: 700 }}>{cat.nameEn}</td>
                  <td>{cat.order}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btn} onClick={() => startEditCategory(cat)}>Edit</button>
                      <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {cat.children?.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ paddingLeft: 28 }}>└ {sub.nameKo}</td>
                    <td style={{ paddingLeft: 28 }}>└ {sub.nameEn}</td>
                    <td>{sub.order}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btn} onClick={() => startEditCategory(sub)}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteCategory(sub.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#888", padding: 20 }}>
                  No categories registered
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>
          Product Management
        </h1>
        <Link href="/admin/products/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          + New Product
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title (KO)</th>
            <th>Title (EN)</th>
            <th>Published</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.titleKo}</td>
              <td>{p.titleEn}</td>
              <td>{p.isPublished ? "Yes" : "No"}</td>
              <td>{p.order}</td>
              <td>
                <div className={styles.actions}>
                  <Link href={`/admin/products/${p.id}`} className={styles.btn}>
                    Edit
                  </Link>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteProduct(p.id)}>
                    Delete
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
