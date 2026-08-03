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
      setError(`Up to ${MAX_IMAGES} images allowed.`);
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
          "unsupported file type": "Only JPG, PNG, WEBP, GIF formats are supported.",
          "file too large": "Each image must be under 5MB.",
          "too many files": "Up to 5 images allowed.",
        };
        setError(messages[body.error] ?? "Error uploading image.");
        return;
      }
      onChange([...value, ...body.images].map((image, order) => ({ ...image, order })));
    } catch {
      setError("Error uploading image.");
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
              <img src={image.url} alt={`Image ${index + 1}`} className={styles.uploaderPreview} />
              {index === 0 && <span className={styles.uploaderPrimary}>Primary</span>}
              <button
                type="button"
                className={styles.uploaderRemove}
                onClick={() => removeImage(image)}
                aria-label={`Delete ${image.fileName}`}
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
          {uploading ? "Uploading..." : `Images ${value.length}/${MAX_IMAGES}`}
        </span>
      </div>
      <p className={styles.uploaderHint}>You can select multiple images. The first one will be used as the primary image.</p>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}
