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

const MAX_IMAGES = 5;

export function ImageUploader({
  value,
  onChange,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    if (value.length + selected.length > MAX_IMAGES) {
      setError(`Jami ${MAX_IMAGES} tagacha rasm yuklash mumkin.`);
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
          "unsupported file type": "Faqat JPG, PNG, WEBP yoki GIF rasm qabul qilinadi.",
          "file too large": "Har bir rasm 5 MB dan kichik bo‘lishi kerak.",
          "too many files": "Bir yozuvga 5 tagacha rasm yuklash mumkin.",
        };
        setError(messages[body.error] ?? "Rasmlarni yuklashda xatolik yuz berdi.");
        return;
      }
      onChange([...value, ...body.images].map((image, order) => ({ ...image, order })));
    } catch {
      setError("Rasmlarni yuklashda xatolik yuz berdi.");
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
              <img src={image.url} alt={`${index + 1}-rasm`} className={styles.uploaderPreview} />
              {index === 0 && <span className={styles.uploaderPrimary}>Asosiy</span>}
              <button
                type="button"
                className={styles.uploaderRemove}
                onClick={() => removeImage(image)}
                aria-label={`${image.fileName} rasmini o‘chirish`}
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
          disabled={uploading || value.length >= MAX_IMAGES}
        />
        <span className={styles.uploaderStatus}>
          {uploading ? "Yuklanmoqda…" : `${value.length}/${MAX_IMAGES} rasm`}
        </span>
      </div>
      <p className={styles.uploaderHint}>Bir martada bir nechta rasm tanlash mumkin. Birinchi rasm asosiy rasm bo‘ladi.</p>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
