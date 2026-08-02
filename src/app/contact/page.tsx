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
  const [showConsentDetail, setShowConsentDetail] = useState(false);

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
          company: data.get("company"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          type: data.get("type"),
          consent: data.get("consent") === "on",
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
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
            <span className={styles.tabText}>
              <strong>{t.contact.breadcrumb}</strong>
            </span>
          </button>
          <a href="#directions" className={styles.tab}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>
            <span className={styles.tabText}>
              <strong>{t.contact.directionsLabel}</strong>
            </span>
          </a>
          <a href="#inquiry" className={styles.tab}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
              <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
              <path d="m3.5 6 8.5 7 8.5-7" />
            </svg>
            <span className={styles.tabText}>
              <strong>{t.contact.formTitle}</strong>
            </span>
          </a>
          <a href="#faq" className={styles.tab}>
            <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 9a3 3 0 1 1 3.5 2.96V14M12 17h.01" />
            </svg>
            <span className={styles.tabText}>
              <strong>{t.contact.faqLabel}</strong>
            </span>
          </a>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoHead}>
              <PhoneIcon className={styles.infoIcon} />
              <span className={styles.infoLabel}>{t.contact.infoTelLabel}</span>
            </div>
            <div className={styles.infoValue}>{t.footer.tel}</div>
            <div className={styles.infoDesc}>{t.contact.infoTelDesc}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoHead}>
              <MailIcon className={styles.infoIcon} />
              <span className={styles.infoLabel}>{t.contact.infoEmailLabel}</span>
            </div>
            <div className={styles.infoValue}>{t.footer.email}</div>
            <div className={styles.infoDesc}>{t.contact.infoEmailDesc}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoHead}>
              <PinIcon className={styles.infoIcon} />
              <span className={styles.infoLabel}>{t.contact.infoAddressLabel}</span>
            </div>
            <div className={`${styles.infoValue} ${styles.infoValueNeutral}`}>{t.footer.address}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoHead}>
              <HeadsetIcon className={styles.infoIcon} />
              <span className={styles.infoLabel}>{t.contact.infoSupportLabel}</span>
            </div>
            <div className={styles.infoDesc}>{t.contact.infoSupportDesc}</div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.card} id="directions">
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
                    <div className={styles.directionIconBox}>
                      <Icon className={styles.directionIcon} />
                    </div>
                    <span className={styles.directionLabel}>{d.mode}</span>
                    <span className={styles.directionDesc}>{d.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.card} id="inquiry">
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
                  <label className={styles.label} htmlFor="company">
                    {t.contact.company}
                  </label>
                  <input className={styles.input} id="company" name="company" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">
                    {t.contact.email} *
                  </label>
                  <input className={styles.input} id="email" name="email" type="email" required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">
                    {t.contact.phone} *
                  </label>
                  <input className={styles.input} id="phone" name="phone" required />
                </div>
              </div>
              <div className={styles.field}>
                <select className={styles.input} id="type" name="type" defaultValue="">
                  <option value="" disabled>
                    {t.contact.typePlaceholder}
                  </option>
                  <option value="general">{t.contact.typeGeneral}</option>
                  <option value="product">{t.contact.typeProduct}</option>
                </select>
              </div>
              <div className={styles.field}>
                <textarea
                  className={styles.textarea}
                  id="message"
                  name="message"
                  placeholder={t.contact.messagePlaceholder}
                  required
                />
              </div>
              <div className={styles.consentRow}>
                <input type="checkbox" id="consent" name="consent" required />
                <label htmlFor="consent">
                  {t.contact.consentLabel}{" "}
                  <button type="button" className={styles.consentLinkBtn} onClick={() => setShowConsentDetail((v) => !v)}>
                    ({t.contact.consentLink})
                  </button>
                </label>
              </div>
              {showConsentDetail && <div className={styles.consentDetail}>{t.contact.consentDetail}</div>}
              <button className={styles.submit} type="submit" disabled={status === "loading"}>
                {t.contact.submit} →
              </button>
              {status === "success" && <p className={`${styles.message} ${styles.success}`}>{t.contact.success}</p>}
              {status === "error" && <p className={`${styles.message} ${styles.error}`}>{t.contact.error}</p>}
            </form>
          </div>
        </div>

        <div className={styles.bottomGrid} id="faq">
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
