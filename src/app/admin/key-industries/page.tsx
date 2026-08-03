"use client";

import { useEffect, useState } from "react";
import { ImageUploader, UploadedImage } from "../ImageUploader";
import styles from "../admin.module.css";

type KeyIndustry = {
  id: string;
  titleKo: string;
  titleEn: string;
  order: number;
  isPublished: boolean;
  images: UploadedImage[];
};

const emptyForm = (): Omit<KeyIndustry, "id"> & { id?: string } => ({
  titleKo: "",
  titleEn: "",
  order: 0,
  isPublished: true,
  images: [],
});

export default function AdminKeyIndustriesPage() {
  const [industries, setIndustries] = useState<KeyIndustry[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/key-industries");
    if (res.ok) setIndustries(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(industry: KeyIndustry) {
    setForm({ ...industry });
    setEditing(true);
  }

  function startNew() {
    setForm(emptyForm());
    setEditing(true);
  }

  function cancel() {
    setForm(emptyForm());
    setEditing(false);
  }

  async function handleSave() {
    if (!form.titleKo || !form.titleEn) return;
    setSaving(true);
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/admin/key-industries", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    setForm(emptyForm());
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this industry?")) return;
    await fetch(`/api/admin/key-industries?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>Key Industries Management</h1>
        {!editing && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startNew}>+ Add New Industry</button>
        )}
      </div>

      {editing && (
        <div className={styles.card}>
          <div className={styles.form}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{form.id ? "Edit Industry" : "Add New Industry"}</h2>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Title (Korean)</label>
                <input className={styles.input} value={form.titleKo} onChange={(e) => setForm({ ...form, titleKo: e.target.value })} placeholder="농업 / 스마트팜" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Title (English)</label>
                <input className={styles.input} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Agriculture / Smart Farm" />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sort Order</label>
              <input className={styles.input} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} style={{ maxWidth: 120 }} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Image</label>
              <ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} />
            </div>

            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              <label className={styles.label}>Published</label>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add"}
              </button>
              <button className={styles.btn} onClick={cancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Image</th>
            <th>Title (KO)</th>
            <th>Title (EN)</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {industries.map((industry) => (
            <tr key={industry.id}>
              <td>{industry.order}</td>
              <td>
                {industry.images[0] ? (
                  <img src={industry.images[0].url} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                ) : (
                  <span style={{ opacity: 0.4 }}>—</span>
                )}
              </td>
              <td>{industry.titleKo}</td>
              <td>{industry.titleEn}</td>
              <td>{industry.isPublished ? "✓" : "—"}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btn} onClick={() => startEdit(industry)}>Edit</button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(industry.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {industries.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, opacity: 0.5 }}>No industries registered.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
