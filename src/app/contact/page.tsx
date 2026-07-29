"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

export default function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.contact.title}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            {t.contact.name}
          </label>
          <input className={styles.input} id="name" name="name" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {t.contact.email}
          </label>
          <input className={styles.input} id="email" name="email" type="email" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">
            {t.contact.phone}
          </label>
          <input className={styles.input} id="phone" name="phone" />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">
            {t.contact.message}
          </label>
          <textarea className={styles.textarea} id="message" name="message" required />
        </div>
        <button className={styles.submit} type="submit" disabled={status === "loading"}>
          {t.contact.submit}
        </button>
        {status === "success" && (
          <p className={`${styles.message} ${styles.success}`}>{t.contact.success}</p>
        )}
        {status === "error" && (
          <p className={`${styles.message} ${styles.error}`}>{t.contact.error}</p>
        )}
      </form>
    </div>
  );
}
