"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type ConfigKey = "navbarLogo" | "footerLogo" | "ctaBannerImage";

const imageSettings: Array<{
  key: ConfigKey;
  title: string;
  description: string;
  pngOnly?: boolean;
  previewBackground: string;
}> = [
  {
    key: "navbarLogo",
    title: "Navbar Logo (PNG)",
    description: "상단 내비게이션에 표시할 로고입니다. 투명 배경 PNG를 권장합니다.",
    pngOnly: true,
    previewBackground: "#ffffff",
  },
  {
    key: "footerLogo",
    title: "Footer Logo (PNG)",
    description: "하단 푸터에 표시할 밝은 색상 로고입니다. 투명 배경 PNG를 권장합니다.",
    pngOnly: true,
    previewBackground: "#0d1b2d",
  },
  {
    key: "ctaBannerImage",
    title: "CTA Banner Background",
    description: "회사소개 페이지 하단 CTA 배너의 배경 이미지입니다.",
    previewBackground: "#f3f4f6",
  },
];

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-config", { cache: "no-store" })
      .then((response) => response.json())
      .then(setConfig)
      .catch(() => setMessage("설정을 불러오지 못했습니다."));
  }, []);

  async function saveConfig(key: ConfigKey, value: string) {
    const response = await fetch("/api/admin/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) throw new Error();
    setConfig((previous) => ({ ...previous, [key]: value }));
  }

  async function uploadImage(key: ConfigKey, file: File, pngOnly = false) {
    setMessage("");
    if (pngOnly && file.type !== "image/png") {
      setMessage("로고는 PNG 파일만 업로드할 수 있습니다.");
      return;
    }

    setBusyKey(key);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const uploadResponse = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error();
      const data = await uploadResponse.json();
      const url = data.images?.[0]?.url as string | undefined;
      if (!url) throw new Error();
      await saveConfig(key, url);
      setMessage("저장되었습니다. 사이트에 바로 적용됩니다.");
    } catch {
      setMessage("이미지 업로드 또는 저장에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeImage(key: ConfigKey) {
    setBusyKey(key);
    setMessage("");
    try {
      await saveConfig(key, "");
      setMessage("기본 로고로 복원되었습니다.");
    } catch {
      setMessage("설정 삭제에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>사이트 설정</h1>
      <div style={{ display: "grid", gap: 20, maxWidth: 760 }}>
        {imageSettings.map((setting) => (
          <section className={styles.card} key={setting.key}>
            <h2 style={{ fontSize: 17, fontWeight: 750, marginBottom: 8 }}>{setting.title}</h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6b7280", marginBottom: 16 }}>
              {setting.description}
            </p>

            <div
              style={{
                minHeight: 110,
                display: "grid",
                placeItems: "center",
                marginBottom: 16,
                padding: 18,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: setting.previewBackground,
              }}
            >
              {config[setting.key] ? (
                <img
                  src={config[setting.key]}
                  alt={`${setting.title} preview`}
                  style={{ display: "block", maxWidth: "100%", maxHeight: 100, objectFit: "contain" }}
                />
              ) : (
                <span style={{ color: "#9ca3af", fontSize: 13 }}>기본 이미지 사용 중</span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label
                style={{
                  padding: "9px 16px",
                  borderRadius: 7,
                  background: "#07152b",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: busyKey ? "default" : "pointer",
                  opacity: busyKey ? .6 : 1,
                }}
              >
                {busyKey === setting.key ? "업로드 중..." : "이미지 업로드"}
                <input
                  type="file"
                  accept={setting.pngOnly ? "image/png" : "image/png,image/jpeg,image/webp"}
                  hidden
                  disabled={Boolean(busyKey)}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(setting.key, file, setting.pngOnly);
                    event.target.value = "";
                  }}
                />
              </label>
              {config[setting.key] && (
                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => void removeImage(setting.key)}
                  style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 7, background: "#fff", cursor: "pointer" }}
                >
                  기본 이미지로 복원
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      {message && <p style={{ marginTop: 16, fontSize: 13, color: message.includes("실패") || message.includes("못했습니다") ? "#dc2626" : "#16a34a" }}>{message}</p>}
    </div>
  );
}
