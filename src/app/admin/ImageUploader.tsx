"use client";

import { useRef, useState } from "react";
import styles from "./admin.module.css";

export type UploadedImage = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  order: number;
};

const DEFAULT_maxImages = 5;

export function ImageUploader({
  value,
  onChange,
  maxImages = DEFAULT_maxImages,
  showPrimary = true,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  showPrimary?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    if (value.length + selected.length > maxImages) {
      setError(`최대 ${maxImages}장까지 업로드할 수 있습니다.`);
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          "unsupported file type": "JPG, PNG, WEBP, GIF 형식만 지원합니다.",
          "file too large": "이미지당 최대 5MB까지 가능합니다.",
          "too many files": "한 번에 최대 30장까지 업로드할 수 있습니다.",
        };
        setError(messages[body.error] ?? "이미지 업로드 중 오류가 발생했습니다.");
        return;
      }
      onChange([...value, ...body.images].map((image, order) => ({ ...image, order })));
    } catch {
      setError("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeImage(image: UploadedImage) {
    const next = value
      .filter((item) => item.id !== image.id)
      .map((item, order) => ({ ...item, order }));
    onChange(next);
    await fetch(`/api/admin/upload?id=${encodeURIComponent(image.id)}`, { method: "DELETE" });
  }

  return (
    <div className={styles.uploader}>
      {value.length > 0 && (
        <div className={styles.uploaderGrid}>
          {value.map((image, index) => (
            <div className={styles.uploaderPreviewWrap} key={image.id}>
              <img src={image.url} alt={`이미지 ${index + 1}`} className={styles.uploaderPreview} />
              {showPrimary && index === 0 && <span className={styles.uploaderPrimary}>대표</span>}
              <button
                type="button"
                className={styles.uploaderRemove}
                onClick={() => removeImage(image)}
                aria-label={`${image.fileName} 삭제`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.uploaderRow}>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={uploading || value.length >= maxImages}
        />
        <span className={styles.uploaderStatus}>
          {uploading ? "업로드 중..." : `이미지 ${value.length}/${maxImages}`}
        </span>
      </div>
      <p className={styles.uploaderHint}>
        {showPrimary
          ? "여러 장을 선택할 수 있으며, 첫 번째 이미지가 대표 이미지로 사용됩니다."
          : "여러 장을 한 번에 선택할 수 있으며, 업로드한 순서대로 상세설명에 표시됩니다."}
      </p>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
