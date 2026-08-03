"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error === "invalid credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : "로그인에 실패했습니다.");
        return;
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <div className={styles.loginTitle}>관리자 로그인</div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            이메일
          </label>
          <input className={styles.input} id="email" name="email" type="email" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            비밀번호
          </label>
          <input className={styles.input} id="password" name="password" type="password" required />
        </div>
        {error && <div className={styles.errorText}>{error}</div>}
        <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={loading}>
          로그인
        </button>
      </form>
    </div>
  );
}
