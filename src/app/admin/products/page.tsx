"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
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
  parentId?: string | null;
  children: Category[];
};

const emptyForm = () => ({ nameKo: "", nameEn: "", order: 0, parentId: "" });

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState(emptyForm());
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    resetForm();
    loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? All subcategories will also be deleted.")) return;
    await fetch(`/api/admin/product-categories?id=${id}`, { method: "DELETE" });
    loadCategories();
  }

  function resetForm() {
    setCatForm(emptyForm());
    setEditingCat(null);
    setShowForm(false);
  }

  function startNew(parentId?: string) {
    setEditingCat(null);
    setCatForm({ ...emptyForm(), parentId: parentId ?? "" });
    setShowForm(true);
  }

  function startEdit(cat: Category, parentId?: string) {
    setEditingCat(cat.id);
    setCatForm({ nameKo: cat.nameKo, nameEn: cat.nameEn, order: cat.order, parentId: parentId ?? "" });
    setShowForm(true);
  }

  const formParentLabel = catForm.parentId
    ? (() => {
        const p = categories.find((c) => c.id === catForm.parentId);
        return p ? `${p.nameKo} / ${p.nameEn}` : "";
      })()
    : "";

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Category Management</h1>
        {!showForm && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => startNew()}>
            + New Category
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: 20 }}>
          <div className={styles.form}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {editingCat ? "Edit Category" : catForm.parentId ? `Add Subcategory to "${formParentLabel}"` : "New Top-level Category"}
            </h2>

            {!editingCat && (
              <div className={styles.field}>
                <label className={styles.label}>Parent Category</label>
                <select
                  className={styles.select || styles.input}
                  value={catForm.parentId}
                  onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
                >
                  <option value="">None (top-level)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameKo} / {c.nameEn}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Name (Korean)</label>
                <input
                  className={styles.input}
                  placeholder="e.g. 교육용키트"
                  value={catForm.nameKo}
                  onChange={(e) => setCatForm({ ...catForm, nameKo: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (English)</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Education Kits"
                  value={catForm.nameEn}
                  onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sort Order</label>
              <input
                className={styles.input}
                type="number"
                value={catForm.order}
                onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })}
                style={{ maxWidth: 120 }}
              />
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveCategory}>
                {editingCat ? "Save Changes" : "Add Category"}
              </button>
              <button className={styles.btn} onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category (KO)</th>
            <th>Category (EN)</th>
            <th>Order</th>
            <th>Subcategories</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <Fragment key={cat.id}>
              <tr>
                <td style={{ fontWeight: 700 }}>{cat.nameKo}</td>
                <td style={{ fontWeight: 700 }}>{cat.nameEn}</td>
                <td>{cat.order}</td>
                <td>{cat.children?.length ?? 0}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btn} onClick={() => startNew(cat.id)} title="Add subcategory">+ Sub</button>
                    <button className={styles.btn} onClick={() => startEdit(cat)}>Edit</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                  </div>
                </td>
              </tr>
              {cat.children?.map((sub) => (
                <tr key={sub.id} style={{ background: "#f9fafb" }}>
                  <td style={{ paddingLeft: 32, color: "#5a6878" }}>└ {sub.nameKo}</td>
                  <td style={{ paddingLeft: 32, color: "#5a6878" }}>└ {sub.nameEn}</td>
                  <td>{sub.order}</td>
                  <td></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btn} onClick={() => startEdit(sub, cat.id)}>Edit</button>
                      <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDeleteCategory(sub.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#888", padding: 20 }}>
                No categories registered
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.toolbar} style={{ marginTop: 32 }}>
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
