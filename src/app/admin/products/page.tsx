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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("이 제품을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
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
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(p.id)}>
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
