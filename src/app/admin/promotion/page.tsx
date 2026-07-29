"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type Post = {
  id: string;
  titleKo: string;
  titleEn: string;
  isPublished: boolean;
  category: { nameKo: string };
};

type Category = { id: string; nameKo: string; nameEn: string; slug: string };

export default function AdminPromotionPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatKo, setNewCatKo] = useState("");
  const [newCatEn, setNewCatEn] = useState("");

  async function load() {
    const [postsRes, catRes] = await Promise.all([
      fetch("/api/admin/promotion/posts"),
      fetch("/api/promotion/categories"),
    ]);
    setPosts(await postsRes.json());
    setCategories(await catRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/promotion/posts/${id}`, { method: "DELETE" });
    load();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatSlug || !newCatKo || !newCatEn) return;
    await fetch("/api/promotion/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newCatSlug, nameKo: newCatKo, nameEn: newCatEn }),
    });
    setNewCatSlug("");
    setNewCatKo("");
    setNewCatEn("");
    load();
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>
          홍보센터 관리
        </h1>
        <Link href="/admin/promotion/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          + 게시글 등록
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>카테고리</th>
            <th>제목(KO)</th>
            <th>제목(EN)</th>
            <th>공개</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.category?.nameKo}</td>
              <td>{p.titleKo}</td>
              <td>{p.titleEn}</td>
              <td>{p.isPublished ? "공개" : "비공개"}</td>
              <td>
                <div className={styles.actions}>
                  <Link href={`/admin/promotion/${p.id}`} className={styles.btn}>
                    수정
                  </Link>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(p.id)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className={styles.pageTitle} style={{ fontSize: 18, marginTop: 32 }}>
        카테고리 관리
      </h2>
      <table className={styles.table} style={{ marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Slug</th>
            <th>이름(KO)</th>
            <th>이름(EN)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.slug}</td>
              <td>{c.nameKo}</td>
              <td>{c.nameEn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className={styles.formRow} onSubmit={handleAddCategory} style={{ maxWidth: 640, alignItems: "end" }}>
        <div className={styles.field}>
          <label className={styles.label}>Slug</label>
          <input className={styles.input} value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} placeholder="news" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>이름(KO)</label>
          <input className={styles.input} value={newCatKo} onChange={(e) => setNewCatKo(e.target.value)} placeholder="뉴스" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>이름(EN)</label>
          <input className={styles.input} value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} placeholder="News" />
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">
          추가
        </button>
      </form>
    </div>
  );
}
