"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";

type Product = {
  id: string;
  titleKo: string;
  titleEn: string;
  isPublished: boolean;
  order: number;
  categoryId?: string | null;
  category?: { id: string; nameKo: string; nameEn: string; parentId?: string | null } | null;
  images?: Array<{ id: string; url: string }>;
};

type Category = {
  id: string;
  nameKo: string;
  nameEn: string;
  order: number;
  parentId?: string | null;
  children: Category[];
};

const PAGE_SIZE = 12;
const emptyForm = () => ({ nameKo: "", nameEn: "", order: 0, parentId: "" });

export default function AdminProductsPage() {
  const [view, setView] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [catForm, setCatForm] = useState(emptyForm());
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    const response = await fetch("/api/admin/products");
    setProducts(response.ok ? await response.json() : []);
  }

  async function loadCategories() {
    const response = await fetch("/api/admin/product-categories");
    setCategories(response.ok ? await response.json() : []);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((response) => response.ok ? response.json() : []),
      fetch("/api/admin/product-categories").then((response) => response.ok ? response.json() : []),
    ]).then(([productData, categoryData]) => {
      setProducts(productData);
      setCategories(categoryData);
    }).catch(() => {
      setProducts([]);
      setCategories([]);
    });
  }, []);

  const flatCategories = useMemo(
    () => categories.flatMap((parent) => [parent, ...(parent.children ?? [])]),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalized || product.titleKo.toLowerCase().includes(normalized) || product.titleEn.toLowerCase().includes(normalized);
      const selectedCategory = flatCategories.find((category) => category.id === categoryFilter);
      const childIds = selectedCategory && !selectedCategory.parentId
        ? [selectedCategory.id, ...(selectedCategory.children ?? []).map((child) => child.id)]
        : [categoryFilter];
      const matchesCategory = categoryFilter === "all" || childIds.includes(product.categoryId ?? product.category?.id ?? "");
      const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? product.isPublished : !product.isPublished);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, categoryFilter, statusFilter, flatCategories]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery(""); setCategoryFilter("all"); setStatusFilter("all"); setPage(1);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("이 제품을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    void loadProducts();
  }

  async function handleSaveCategory() {
    if (!catForm.nameKo || !catForm.nameEn) return;
    await fetch("/api/admin/product-categories", {
      method: editingCat ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCat ? { id: editingCat, nameKo: catForm.nameKo, nameEn: catForm.nameEn, order: catForm.order } : catForm),
    });
    resetCategoryForm();
    void loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("카테고리와 하위 카테고리를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/product-categories?id=${id}`, { method: "DELETE" });
    void loadCategories();
  }

  function resetCategoryForm() { setCatForm(emptyForm()); setEditingCat(null); setShowForm(false); }
  function startNew(parentId = "") { setEditingCat(null); setCatForm({ ...emptyForm(), parentId }); setShowForm(true); }
  function startEdit(category: Category, parentId = "") {
    setEditingCat(category.id);
    setCatForm({ nameKo: category.nameKo, nameEn: category.nameEn, order: category.order, parentId });
    setShowForm(true);
  }

  return (
    <div>
      <div className={styles.pageHeading}>
        <div><h1>제품 관리</h1><p>상품 목록과 카테고리를 분리하여 효율적으로 관리합니다.</p></div>
        {view === "products" && <Link href="/admin/products/new" className={`${styles.btn} ${styles.btnPrimary}`}>+ 새 제품 등록</Link>}
        {view === "categories" && !showForm && <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => startNew()}>+ 새 카테고리</button>}
      </div>

      <div className={styles.manageTabs}>
        <button className={view === "products" ? styles.manageTabActive : ""} onClick={() => setView("products")}>상품 목록 <b>{products.length}</b></button>
        <button className={view === "categories" ? styles.manageTabActive : ""} onClick={() => setView("categories")}>카테고리 관리 <b>{flatCategories.length}</b></button>
      </div>

      {view === "products" ? (
        <>
          <div className={styles.filterBar}>
            <div className={styles.searchField}><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="제품명으로 검색" /></div>
            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}>
              <option value="all">전체 카테고리</option>
              {categories.map((parent) => (
                <Fragment key={parent.id}>
                  <option value={parent.id}>{parent.nameKo}</option>
                  {parent.children?.map((child) => <option value={child.id} key={child.id}>　↳ {child.nameKo}</option>)}
                </Fragment>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
              <option value="all">전체 상태</option><option value="published">공개</option><option value="hidden">비공개</option>
            </select>
            <button className={styles.btn} onClick={resetFilters}>초기화</button>
          </div>

          <div className={styles.listSummary}><strong>{filteredProducts.length}</strong>개 제품 <span>페이지 {page} / {totalPages}</span></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>제품</th><th>카테고리</th><th>상태</th><th>정렬</th><th>관리</th></tr></thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td><div className={styles.adminProductCell}>{product.images?.[0]?.url ? <img src={product.images[0].url} alt="" /> : <span>NO IMAGE</span>}<div><strong>{product.titleKo}</strong><small>{product.titleEn}</small></div></div></td>
                    <td>{product.category?.nameKo ?? "미분류"}</td>
                    <td><span className={`${styles.statusBadge} ${product.isPublished ? styles.statusPublished : styles.statusHidden}`}>{product.isPublished ? "공개" : "비공개"}</span></td>
                    <td>{product.order}</td>
                    <td><div className={styles.actions}><Link href={`/admin/products/${product.id}`} className={styles.btn}>수정</Link><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => void handleDeleteProduct(product.id)}>삭제</button></div></td>
                  </tr>
                ))}
                {visibleProducts.length === 0 && <tr><td colSpan={5} className={styles.emptyCell}>조건에 맞는 제품이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className={styles.adminPagination}><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.paginationActive : ""} onClick={() => setPage(number)}>{number}</button>)}<button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>→</button></div>}
        </>
      ) : (
        <>
          {showForm && <div className={styles.card}><h2 className={styles.cardTitle}>{editingCat ? "카테고리 수정" : catForm.parentId ? "하위 카테고리 추가" : "새 카테고리"}</h2><div className={styles.compactCategoryForm}>
            {!editingCat && <div className={styles.field}><label className={styles.label}>상위 카테고리</label><select className={styles.select} value={catForm.parentId} onChange={(event) => setCatForm({ ...catForm, parentId: event.target.value })}><option value="">없음 (최상위)</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.nameKo}</option>)}</select></div>}
            <div className={styles.field}><label className={styles.label}>이름 (KO)</label><input className={styles.input} value={catForm.nameKo} onChange={(event) => setCatForm({ ...catForm, nameKo: event.target.value })} /></div>
            <div className={styles.field}><label className={styles.label}>이름 (EN)</label><input className={styles.input} value={catForm.nameEn} onChange={(event) => setCatForm({ ...catForm, nameEn: event.target.value })} /></div>
            <div className={styles.field}><label className={styles.label}>정렬</label><input className={styles.input} type="number" value={catForm.order} onChange={(event) => setCatForm({ ...catForm, order: Number(event.target.value) })} /></div>
            <div className={styles.actions}><button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => void handleSaveCategory()}>저장</button><button className={styles.btn} onClick={resetCategoryForm}>취소</button></div>
          </div></div>}
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>카테고리 (KO)</th><th>카테고리 (EN)</th><th>정렬</th><th>하위</th><th>관리</th></tr></thead><tbody>
            {categories.map((category) => <Fragment key={category.id}><tr className={styles.parentCategoryRow}><td><strong>{category.nameKo}</strong></td><td><strong>{category.nameEn}</strong></td><td>{category.order}</td><td>{category.children?.length ?? 0}</td><td><div className={styles.actions}><button className={styles.btn} onClick={() => startNew(category.id)}>+ 하위</button><button className={styles.btn} onClick={() => startEdit(category)}>수정</button><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => void handleDeleteCategory(category.id)}>삭제</button></div></td></tr>{category.children?.map((child) => <tr className={styles.childCategoryRow} key={child.id}><td>↳ {child.nameKo}</td><td>↳ {child.nameEn}</td><td>{child.order}</td><td>—</td><td><div className={styles.actions}><button className={styles.btn} onClick={() => startEdit(child, category.id)}>수정</button><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => void handleDeleteCategory(child.id)}>삭제</button></div></td></tr>)}</Fragment>)}
          </tbody></table></div>
        </>
      )}
    </div>
  );
}
