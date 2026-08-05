"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type ConfigKey =
  | "navbarLogo"
  | "footerLogo"
  | "ctaBannerImage"
  | "homeHeroImage"
  | "aboutHeroImage"
  | "businessHeroImage"
  | "promotionHeroImage"
  | "contactHeroImage"
  | "productHeroImage1"
  | "productHeroImage2"
  | "productHeroImage3"
  | "productHeroImage4"
  | "productHeroImage5";

type ImageSetting = {
  key: ConfigKey;
  title: string;
  description: string;
  recommendedSize?: string;
  defaultImage?: string;
  pngOnly?: boolean;
  previewBackground?: string;
};

const imageSettings: ImageSetting[] = [
  {
    key: "navbarLogo",
    title: "상단 로고 (PNG)",
    description: "내비게이션 바에 표시되는 로고입니다. 배경이 흰색/밝은 색이므로 어두운 계열 색상(짙은 남색, 검정 등) 로고를 사용하세요. 배경은 반드시 투명(PNG)이어야 합니다.",
    recommendedSize: "420 × 84 px (표시 크기 210 × 42 px, 2배 해상도 권장)",
    pngOnly: true,
    previewBackground: "#fff",
  },
  {
    key: "footerLogo",
    title: "푸터 로고 (PNG)",
    description: "하단 푸터에 표시되는 로고입니다. 배경이 짙은 남색(#0d1b2d)이므로 흰색 또는 밝은 색상 로고를 사용하세요. 배경은 반드시 투명(PNG)이어야 합니다.",
    recommendedSize: "460 × 92 px (표시 크기 230 × 46 px, 2배 해상도 권장)",
    pngOnly: true,
    previewBackground: "#0d1b2d",
  },
  { key: "homeHeroImage", title: "메인 배너", description: "메인 페이지 상단 배너 이미지입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/home-bg.png" },
  { key: "aboutHeroImage", title: "회사소개 배너", description: "회사소개 페이지 상단 배너 이미지입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/home-hero-bg.png" },
  { key: "businessHeroImage", title: "솔루션 배너", description: "솔루션 페이지 상단 배너 이미지입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/sulutions-bg-0.png" },
  { key: "promotionHeroImage", title: "홍보센터 배너", description: "홍보센터 목록과 상세 페이지에 함께 적용됩니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/promotion-hero.png" },
  { key: "contactHeroImage", title: "Contact 배너", description: "Contact 페이지 상단 배너 이미지입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/contact-hero.png" },
  { key: "productHeroImage1", title: "제품 배너 1", description: "제품 페이지 첫 번째 슬라이드입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/product_bg.png" },
  { key: "productHeroImage2", title: "제품 배너 2", description: "제품 페이지 두 번째 슬라이드입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/product_bg-1.png" },
  { key: "productHeroImage3", title: "제품 배너 3", description: "제품 페이지 세 번째 슬라이드입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/product_bg-2.png" },
  { key: "productHeroImage4", title: "제품 배너 4", description: "제품 페이지 네 번째 슬라이드입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/product_bg-3.png" },
  { key: "productHeroImage5", title: "제품 배너 5", description: "제품 페이지 다섯 번째 슬라이드입니다.", recommendedSize: "1600 × 500 px (비율 16:5)", defaultImage: "/images/product_bg-4.png" },
  { key: "ctaBannerImage", title: "회사소개 CTA 배너", description: "회사소개 페이지 하단 배너 이미지입니다.", defaultImage: "/images/about-image-2.png" },
];

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<ConfigKey | null>(null);
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: Record<string, string>) => { setConfig(data); setCompanyName(data.companyName ?? ""); })
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

  async function uploadImage(setting: ImageSetting, file: File) {
    setMessage("");
    if (setting.pngOnly && file.type !== "image/png") {
      setMessage("로고는 PNG 파일만 업로드할 수 있습니다.");
      return;
    }

    setBusyKey(setting.key);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const url = data.images?.[0]?.url as string | undefined;
      if (!url) throw new Error();
      await saveConfig(setting.key, url);
      setMessage("이미지가 저장되었습니다. 사이트에 바로 적용됩니다.");
    } catch {
      setMessage("이미지 업로드 또는 저장에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  async function restoreDefault(key: ConfigKey) {
    setBusyKey(key);
    setMessage("");
    try {
      await saveConfig(key, "");
      setMessage("기본 이미지로 복원되었습니다.");
    } catch {
      setMessage("설정 삭제에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  async function saveCompanyName() {
    setNameSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "companyName", value: companyName }),
      });
      if (!response.ok) throw new Error();
      setMessage("회사 이름이 저장되었습니다.");
    } catch {
      setMessage("저장에 실패했습니다.");
    } finally {
      setNameSaving(false);
    }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>사이트 설정</h1>

      <section className={styles.card} style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 750, marginBottom: 8 }}>회사 이름</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
          내비게이션, 푸터, 저작권 표시에 사용되는 회사 이름입니다.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ETCOMPANY"
            style={{ flex: 1, padding: "9px 14px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, outline: "none" }}
          />
          <button
            type="button"
            disabled={nameSaving}
            onClick={() => void saveCompanyName()}
            style={{ padding: "9px 18px", borderRadius: 7, background: "#07152b", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: nameSaving ? "default" : "pointer", opacity: nameSaving ? 0.6 : 1 }}
          >
            {nameSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </section>

      <h2 style={{ fontSize: 17, fontWeight: 750, marginBottom: 6 }}>이미지 설정</h2>
      <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>
        배너 권장 비율은 약 16:5이며 JPG, PNG, WEBP 파일을 사용할 수 있습니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {imageSettings.map((setting) => {
          const preview = config[setting.key] || setting.defaultImage;
          return (
            <section className={styles.card} key={setting.key}>
              <h2 style={{ fontSize: 17, fontWeight: 750, marginBottom: 8 }}>{setting.title}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6b7280", marginBottom: setting.recommendedSize ? 4 : 16 }}>{setting.description}</p>
              {setting.recommendedSize && (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#334155", marginBottom: 16 }}>
                  권장 크기: <strong style={{ color: "#07152b", fontWeight: 800 }}>{setting.recommendedSize}</strong>
                </p>
              )}
              <div style={{ height: 150, display: "grid", placeItems: "center", marginBottom: 16, padding: 12, overflow: "hidden", border: "1px solid #e5e7eb", borderRadius: 10, background: setting.previewBackground || "#f3f4f6" }}>
                {preview ? (
                  <img src={preview} alt={`${setting.title} preview`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>기본 이미지 사용 중</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <label style={{ padding: "9px 16px", borderRadius: 7, background: "#07152b", color: "#fff", fontSize: 13, fontWeight: 700, cursor: busyKey ? "default" : "pointer", opacity: busyKey ? 0.6 : 1 }}>
                  {busyKey === setting.key ? "업로드 중..." : "이미지 업로드"}
                  <input type="file" accept={setting.pngOnly ? "image/png" : "image/png,image/jpeg,image/webp"} hidden disabled={Boolean(busyKey)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(setting, file); event.target.value = ""; }} />
                </label>
                {config[setting.key] && (
                  <button type="button" disabled={Boolean(busyKey)} onClick={() => void restoreDefault(setting.key)} style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 7, background: "#fff", cursor: "pointer" }}>
                    기본 이미지로 복원
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
      {message && <p style={{ marginTop: 16, fontSize: 13, color: message.includes("실패") || message.includes("못했습니다") ? "#dc2626" : "#16a34a" }}>{message}</p>}
    </div>
  );
}
