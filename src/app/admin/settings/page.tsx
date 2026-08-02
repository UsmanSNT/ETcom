"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  async function saveConfig(key: string, value: string) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      setConfig((prev) => ({ ...prev, [key]: value }));
      setMessage("저장되었습니다.");
    } catch {
      setMessage("저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const url = data.images[0]?.url;
      if (url) {
        await saveConfig("ctaBannerImage", url);
      }
    } catch {
      setMessage("이미지 업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>사이트 설정</h1>

      <div className={styles.card} style={{ maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>CTA 배너 배경 이미지</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          회사소개 페이지 하단 CTA 배너의 배경 이미지를 설정합니다.
        </p>

        {config.ctaBannerImage && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={config.ctaBannerImage}
              alt="CTA banner preview"
              style={{ width: "100%", maxWidth: 400, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label
            style={{
              padding: "8px 16px",
              background: "#07152b",
              color: "#fff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: uploading ? "default" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "업로드 중..." : "이미지 업로드"}
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={uploading} />
          </label>

          <input
            type="text"
            placeholder="또는 이미지 URL 직접 입력"
            value={config.ctaBannerImage ?? ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, ctaBannerImage: e.target.value }))}
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={() => saveConfig("ctaBannerImage", config.ctaBannerImage ?? "")}
            disabled={saving}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            저장
          </button>
        </div>

        {message && <p style={{ marginTop: 12, fontSize: 13, color: message.includes("실패") ? "#dc2626" : "#16a34a" }}>{message}</p>}
      </div>
    </div>
  );
}
