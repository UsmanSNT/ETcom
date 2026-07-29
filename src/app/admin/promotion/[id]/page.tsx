"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PostForm, type PostFormValues } from "../PostForm";
import styles from "../../admin.module.css";

export default function EditPromotionPostPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<PostFormValues | null>(null);

  useEffect(() => {
    fetch("/api/admin/promotion/posts")
      .then((res) => res.json())
      .then((posts) => {
        const found = posts.find((p: { id: string }) => p.id === params.id);
        setInitial(found ? { ...found, categoryId: found.category?.id ?? found.categoryId } : null);
      });
  }, [params.id]);

  if (!initial) return null;

  return (
    <div>
      <h1 className={styles.pageTitle}>게시글 수정</h1>
      <PostForm postId={params.id} initial={initial} />
    </div>
  );
}
