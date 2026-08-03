"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm, type ProductFormValues } from "../ProductForm";
import styles from "../../admin.module.css";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((products) => {
        const found = products.find((p: { id: string }) => p.id === params.id);
        setInitial(found ?? null);
      });
  }, [params.id]);

  if (!initial) return null;

  return (
    <div>
      <h1 className={styles.pageTitle}>Edit Product</h1>
      <ProductForm productId={params.id} initial={initial} />
    </div>
  );
}
