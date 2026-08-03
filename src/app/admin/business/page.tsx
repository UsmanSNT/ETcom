"use client";

import { useEffect, useState } from "react";
import { ImageUploader, UploadedImage } from "../ImageUploader";
import styles from "../admin.module.css";

type BusinessArea = {
  id: string;
  titleKo: string;
  titleEn: string;
  itemsKo: string[];
  itemsEn: string[];
  icon: string;
  order: number;
  isPublished: boolean;
  images: UploadedImage[];
};

const ICON_OPTIONS = [
  { value: "leaf", label: "Smart Farm" },
  { value: "truck", label: "Industrial IoT" },
  { value: "cap", label: "Education" },
  { value: "chip", label: "Embedded & AI" },
];

const emptyForm = (): Omit<BusinessArea, "id"> & { id?: string } => ({
  titleKo: "",
  titleEn: "",
  itemsKo: [""],
  itemsEn: [""],
  icon: "leaf",
  order: 0,
  isPublished: true,
  images: [],
});

export default function AdminBusinessPage() {
  const [areas, setAreas] = useState<BusinessArea[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/business-areas");
    if (res.ok) setAreas(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(area: BusinessArea) {
    setForm({ ...area, itemsKo: area.itemsKo.length ? area.itemsKo : [""], itemsEn: area.itemsEn.length ? area.itemsEn : [""] });
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

  function updateItems(lang: "Ko" | "En", index: number, value: string) {
    const key = `items${lang}` as "itemsKo" | "itemsEn";
    const arr = [...form[key]];
    arr[index] = value;
    setForm({ ...form, [key]: arr });
  }

  function addItem(lang: "Ko" | "En") {
    const key = `items${lang}` as "itemsKo" | "itemsEn";
    setForm({ ...form, [key]: [...form[key], ""] });
  }

  function removeItem(lang: "Ko" | "En", index: number) {
    const key = `items${lang}` as "itemsKo" | "itemsEn";
    setForm({ ...form, [key]: form[key].filter((_, i) => i !== index) });
  }

  async function handleSave() {
    if (!form.titleKo || !form.titleEn) return;
    setSaving(true);
    const payload = {
      ...form,
      itemsKo: form.itemsKo.filter(Boolean),
      itemsEn: form.itemsEn.filter(Boolean),
    };
    if (form.id) {
      await fetch("/api/admin/business-areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/business-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setEditing(false);
    setForm(emptyForm());
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this business area?")) return;
    await fetch(`/api/admin/business-areas?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>Business Area Management</h1>
        {!editing && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startNew}>+ Add New Area</button>
        )}
      </div>

      {editing && (
        <div className={styles.card}>
          <div className={styles.form}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{form.id ? "Edit Area" : "Add New Area"}</h2>

            <div className={styles.field}>
              <label className={styles.label}>Icon</label>
              <select className={styles.select} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Title (Korean)</label>
                <input className={styles.input} value={form.titleKo} onChange={(e) => setForm({ ...form, titleKo: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Title (English)</label>
                <input className={styles.input} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Items (Korean)</label>
                {form.itemsKo.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <input className={styles.input} style={{ flex: 1 }} value={item} onChange={(e) => updateItems("Ko", i, e.target.value)} placeholder={`Item ${i + 1}`} />
                    {form.itemsKo.length > 1 && (
                      <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => removeItem("Ko", i)} style={{ padding: "6px 10px" }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.btn} onClick={() => addItem("Ko")}>+ Add</button>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Items (English)</label>
                {form.itemsEn.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <input className={styles.input} style={{ flex: 1 }} value={item} onChange={(e) => updateItems("En", i, e.target.value)} placeholder={`Item ${i + 1}`} />
                    {form.itemsEn.length > 1 && (
                      <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => removeItem("En", i)} style={{ padding: "6px 10px" }}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.btn} onClick={() => addItem("En")}>+ Add</button>
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
            <th>Items</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.id}>
              <td>{area.order}</td>
              <td>
                {area.images[0] ? (
                  <img src={area.images[0].url} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                ) : (
                  <span style={{ opacity: 0.4 }}>—</span>
                )}
              </td>
              <td>{area.titleKo}</td>
              <td>{area.titleEn}</td>
              <td>{area.itemsKo.length}</td>
              <td>{area.isPublished ? "✓" : "—"}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btn} onClick={() => startEdit(area)}>Edit</button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(area.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {areas.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, opacity: 0.5 }}>No business areas registered.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
