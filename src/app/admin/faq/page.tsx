"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type FaqItem = {
  id: string;
  questionKo: string;
  questionEn: string;
  answerKo: string;
  answerEn: string;
  order: number;
  isPublished: boolean;
};

const emptyForm = (): Omit<FaqItem, "id"> & { id?: string } => ({
  questionKo: "",
  questionEn: "",
  answerKo: "",
  answerEn: "",
  order: 0,
  isPublished: true,
});

const DEFAULT_FAQS: Array<Omit<FaqItem, "id">> = [
  { questionKo: "Q1. 어떤 제품과 서비스를 제공하나요?", questionEn: "Q1. What products and services do you offer?", answerKo: "ETCOMPANY는 스마트팜, 산업용 IoT, 임베디드 시스템, 교육기자재 및 OEM·ODM 솔루션을 제공합니다.", answerEn: "ETCOMPANY provides smart farm, industrial IoT, embedded systems, educational equipment, and OEM·ODM solutions.", order: 1, isPublished: true },
  { questionKo: "Q2. 제품에 대한 기술 상담이 가능한가요?", questionEn: "Q2. Can I receive technical consultation on products?", answerKo: "네. 제품 선택부터 적용 방법, 기술 문의까지 전문 엔지니어가 상담해드립니다.", answerEn: "Yes. Our expert engineers are available for consultation from product selection to application and technical inquiries.", order: 2, isPublished: true },
  { questionKo: "Q3. OEM·ODM 시제품 개발이 가능한가요?", questionEn: "Q3. Is OEM·ODM prototype development available?", answerKo: "가능합니다. 제품 기획부터 PCB 설계, 펌웨어 개발, 기구 설계, 시제품 제작 및 양산까지 One-stop 서비스를 제공합니다.", answerEn: "Yes. We offer One-stop services from product planning, PCB design, firmware development, mechanical design, prototyping to mass production.", order: 3, isPublished: true },
  { questionKo: "Q4. 제품 구매는 어떻게 하나요?", questionEn: "Q4. How can I purchase products?", answerKo: "당사가 운영하는 이티몰 쇼핑몰 외 쿠팡, 네이버 등을 통해 구매할 수 있으며, 대량 구매는 별도 문의해 주시기 바랍니다.", answerEn: "Products are available through our ETMALL shop, Coupang, Naver, and others. For bulk purchases, please contact us separately.", order: 4, isPublished: true },
  { questionKo: "Q5. 제품의 A/S는 어떻게 받을 수 있나요?", questionEn: "Q5. How can I get after-sales service?", answerKo: "고객센터를 통해 접수하시면 제품 확인 후 수리 또는 교환 절차를 안내해드립니다.", answerEn: "Please submit a request through our customer center, and we will guide you through the repair or exchange process.", order: 5, isPublished: true },
  { questionKo: "Q6. 제품 사용 매뉴얼과 자료는 어디에서 확인할 수 있나요?", questionEn: "Q6. Where can I find product manuals and resources?", answerKo: "구매하시는 제품에 QR코드로 동봉되어 있습니다.", answerEn: "A QR code linking to the manual is included with the product at time of purchase.", order: 6, isPublished: true },
  { questionKo: "Q7. 스마트팜 구축 및 기술 지원이 가능한가요?", questionEn: "Q7. Is smart farm construction and technical support available?", answerKo: "네. 환경제어, 식물생장 LED, 센서, 통합제어 시스템 등 구축 및 기술 지원을 제공합니다.", answerEn: "Yes. We provide construction and technical support for environment control, plant-growth LED, sensors, and integrated control systems.", order: 7, isPublished: true },
  { questionKo: "Q8. 산업용 자동화 시스템도 맞춤 제작이 가능한가요?", questionEn: "Q8. Is custom manufacturing of industrial automation systems available?", answerKo: "가능합니다. 고객 환경에 맞는 하드웨어와 소프트웨어를 설계하여 제공합니다.", answerEn: "Yes. We design and deliver hardware and software tailored to your environment.", order: 8, isPublished: true },
  { questionKo: "Q9. 교육기관 납품 및 견적 요청이 가능한가요?", questionEn: "Q9. Can educational institutions request supply and quotation?", answerKo: "네. 학교, 대학, 연구기관, 공공기관 등 다양한 교육기관 납품 및 견적 상담을 지원합니다.", answerEn: "Yes. We support supply and quotation consultations for schools, universities, research institutes, and public institutions.", order: 9, isPublished: true },
  { questionKo: "Q10. 견적 및 상담은 어떻게 신청하나요?", questionEn: "Q10. How can I request a quote or consultation?", answerKo: "전화, 이메일 또는 홈페이지 문의를 통해 상담을 신청하실 수 있으며, 담당자가 빠르게 안내해드립니다.", answerEn: "You can request a consultation by phone, email, or through the website inquiry form, and our representative will respond promptly.", order: 10, isPublished: true },
];

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/faq");
    if (res.ok) setFaqs(await res.json());
  }

  useEffect(() => { load(); }, []);

  function startEdit(faq: FaqItem) {
    setForm({ ...faq });
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
    if (!form.questionKo || !form.questionEn) return;
    setSaving(true);
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/admin/faq", {
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
    if (!confirm("이 FAQ 항목을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    load();
  }

  async function handleSeedDefaults() {
    if (!confirm(`기본 FAQ ${DEFAULT_FAQS.length}개를 등록하시겠습니까?`)) return;
    setSaving(true);
    for (const faq of DEFAULT_FAQS) {
      await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faq),
      });
    }
    setSaving(false);
    load();
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>자주 묻는 질문 관리</h1>
        {!editing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className={styles.btn} onClick={handleSeedDefaults} disabled={saving}>기본 데이터 불러오기</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startNew}>+ 신규 등록</button>
          </div>
        )}
      </div>

      {editing && (
        <div className={styles.card}>
          <div className={styles.form}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{form.id ? "FAQ 수정" : "신규 등록"}</h2>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>질문 (한국어)</label>
                <input className={styles.input} value={form.questionKo} onChange={(e) => setForm({ ...form, questionKo: e.target.value })} placeholder="제품 구매는 어떻게 진행되나요?" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>질문 (영어)</label>
                <input className={styles.input} value={form.questionEn} onChange={(e) => setForm({ ...form, questionEn: e.target.value })} placeholder="How does the purchase process work?" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>답변 (한국어)</label>
                <textarea className={styles.textarea} value={form.answerKo} onChange={(e) => setForm({ ...form, answerKo: e.target.value })} placeholder="답변을 입력하세요" rows={3} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>답변 (영어)</label>
                <textarea className={styles.textarea} value={form.answerEn} onChange={(e) => setForm({ ...form, answerEn: e.target.value })} placeholder="Enter the answer" rows={3} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>정렬 순서</label>
              <input className={styles.input} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} style={{ maxWidth: 120 }} />
            </div>

            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              <label className={styles.label}>공개</label>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
                {saving ? "저장 중..." : form.id ? "변경 사항 저장" : "등록"}
              </button>
              <button className={styles.btn} onClick={cancel}>취소</button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>순서</th>
            <th>질문(KO)</th>
            <th>질문(EN)</th>
            <th>공개</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq.id}>
              <td>{faq.order}</td>
              <td>{faq.questionKo}</td>
              <td>{faq.questionEn}</td>
              <td>{faq.isPublished ? "✓" : "—"}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btn} onClick={() => startEdit(faq)}>수정</button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(faq.id)}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
          {faqs.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, opacity: 0.5 }}>등록된 FAQ가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
