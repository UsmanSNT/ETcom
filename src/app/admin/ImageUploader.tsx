"use client";

import { useRef, useState } from "react";
import styles from "./admin.module.css";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error === "unsupported file type" ? "지원되지 않는 파일 형식입니다." : "업로드에 실패했습니다.");
        return;
      }
      onChange(body.url);
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.uploader}>
      {value && (
        <div className={styles.uploaderPreviewWrap}>
          <img src={value} alt="" className={styles.uploaderPreview} />
          <button type="button" className={styles.uploaderRemove} onClick={() => onChange("")}>
            삭제
          </button>
        </div>
      )}
      <div className={styles.uploaderRow}>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <span className={styles.uploaderStatus}>업로드 중...</span>}
      </div>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="또는 이미지 URL을 직접 입력하세요"
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
