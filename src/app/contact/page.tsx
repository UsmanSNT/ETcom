"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PhoneIcon, MailIcon, PinIcon, HeadsetIcon, PlusIcon, CarIcon, TrainIcon, BusIcon } from "@/components/icons/SolutionIcons";

const DIRECTION_ICONS = [CarIcon, TrainIcon, BusIcon];
import styles from "./page.module.css";

export default function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          type: data.get("type"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <div className={styles.breadcrumb}>HOME &gt; {t.contact.breadcrumb}</div>
            <div className={styles.label}>{t.contact.label}</div>
            <h1 className={styles.title}>
              {t.contact.title1}
              <br />
              {t.contact.title2}
            </h1>
            <div className={styles.divider} />
            <p className={styles.desc}>
              {t.contact.desc1}
              <br />
              {t.contact.desc2}
            </p>
          </div>
          <div className={styles.art} />
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <PhoneIcon className={styles.infoIcon} />
            <div className={styles.infoLabel}>{t.contact.infoTelLabel}</div>
            <div className={styles.infoValue}>{t.footer.tel}</div>
            <div className={styles.infoDesc}>{t.contact.infoTelDesc}</div>
          </div>
          <div className={styles.infoCard}>
            <MailIcon className={styles.infoIcon} />
            <div className={styles.infoLabel}>{t.contact.infoEmailLabel}</div>
            <div className={styles.infoValue}>{t.footer.email}</div>
            <div className={styles.infoDesc}>{t.contact.infoEmailDesc}</div>
          </div>
          <div className={styles.infoCard}>
            <PinIcon className={styles.infoIcon} />
            <div className={styles.infoLabel}>{t.contact.infoAddressLabel}</div>
            <div className={styles.infoValue}>{t.footer.address}</div>
          </div>
          <div className={styles.infoCard}>
            <HeadsetIcon className={styles.infoIcon} />
            <div className={styles.infoLabel}>{t.contact.infoSupportLabel}</div>
            <div className={styles.infoDesc}>{t.contact.infoSupportDesc}</div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.card}>
            <div className={styles.directionsLabel}>{t.contact.directionsLabel}</div>
            <div className={styles.mapArt}>
              <iframe
                className={styles.mapFrame}
                title="ETCOMPANY location"
                src={`https://www.google.com/maps?q=${encodeURIComponent("전라북도 익산시 약촌로 132")}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={styles.directionsList}>
              {t.contact.directions.map((d, i) => {
                const Icon = DIRECTION_ICONS[i];
                return (
                  <div key={d.mode} className={styles.directionRow}>
                    <Icon className={styles.directionIcon} />
                    <span className={styles.directionLabel}>{d.mode}</span>
                    <span className={styles.directionDesc}>{d.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.colLabel}>{t.contact.formTitle}</div>
            <div className={styles.colDesc}>{t.contact.formDesc}</div>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">
                    {t.contact.name} *
                  </label>
                  <input className={styles.input} id="name" name="name" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">
                    {t.contact.phone}
                  </label>
                  <input className={styles.input} id="phone" name="phone" />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  {t.contact.email} *
                </label>
                <input className={styles.input} id="email" name="email" type="email" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="type">
                  {t.contact.typeLabel}
                </label>
                <select className={styles.input} id="type" name="type" defaultValue="general">
                  <option value="general">{t.contact.typeGeneral}</option>
                  <option value="product">{t.contact.typeProduct}</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="message">
                  {t.contact.message}
                </label>
                <textarea className={styles.textarea} id="message" name="message" required />
              </div>
              <button className={styles.submit} type="submit" disabled={status === "loading"}>
                {t.contact.submit}
              </button>
              {status === "success" && <p className={`${styles.message} ${styles.success}`}>{t.contact.success}</p>}
              {status === "error" && <p className={`${styles.message} ${styles.error}`}>{t.contact.error}</p>}
            </form>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div>
            <div className={styles.colLabel} style={{ fontSize: 16 }}>
              {t.contact.faqLabel}
            </div>
            <div>
              {t.contact.faqs.map((faq, i) => (
                <div key={faq.q} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQ}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <PlusIcon className={`${styles.faqIcon} ${openFaq === i ? styles.faqIconOpen : ""}`} />
                  </button>
                  {openFaq === i && <div className={styles.faqA}>{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.colLabel} style={{ fontSize: 16 }}>
              {t.contact.infoSupportLabel}
            </div>
            <div className={styles.channelsGrid} style={{ marginTop: 16 }}>
              <div className={styles.channelCard}>
                <HeadsetIcon width={20} height={20} style={{ margin: "0 auto 8px", color: "var(--brand-navy)" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-navy)" }}>{t.footer.tel}</div>
              </div>
              <div className={styles.channelCard}>
                <MailIcon width={20} height={20} style={{ margin: "0 auto 8px", color: "var(--brand-navy)" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-navy)" }}>{t.footer.email}</div>
              </div>
              <div className={styles.channelCard}>
                <PinIcon width={20} height={20} style={{ margin: "0 auto 8px", color: "var(--brand-navy)" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-navy)" }}>{t.footer.address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
