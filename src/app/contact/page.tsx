"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PhoneIcon, MailIcon, HeadsetIcon, PlusIcon, CartIcon } from "@/components/icons/SolutionIcons";

type FaqData = { id: string; questionKo: string; questionEn: string; answerKo: string; answerEn: string };
import styles from "./page.module.css";
import { useSiteConfig } from "@/components/useSiteConfig";

export default function ContactPage() {
  const siteConfig = useSiteConfig();
  const { t, locale } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showConsentDetail, setShowConsentDetail] = useState(false);
  const [dbFaqs, setDbFaqs] = useState<FaqData[] | null>(null);

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data: FaqData[]) => { if (Array.isArray(data)) setDbFaqs(data); })
      .catch(() => {});
  }, []);

  const faqs = dbFaqs && dbFaqs.length > 0
    ? dbFaqs.map((f) => ({ q: locale === "ko" ? f.questionKo : f.questionEn, a: locale === "ko" ? f.answerKo : f.answerEn }))
    : t.contact.faqs;

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
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${siteConfig.contactHeroImage || "/images/contact-hero.png"})` }}
      >
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

      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <PhoneIcon className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>{t.contact.infoTelLabel}</span>
              <div className={styles.infoValue}>{t.footer.tel}</div>
              <div className={styles.infoDesc}>{t.contact.infoTelDesc}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <MailIcon className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>{t.contact.infoEmailLabel}</span>
              <div className={styles.infoValue}>{t.footer.email}</div>
              <div className={styles.infoDesc}>{t.contact.infoEmailDesc}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <HeadsetIcon className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>{t.contact.infoSupportLabel}</span>
              <div className={styles.infoDesc}>{t.contact.infoSupportDesc}</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.mainGrid}>
          <div className={styles.card} id="directions">
            <div className={styles.directionsLabel}>{t.contact.directionsLabel}</div>
            <div className={styles.mapLink}>
              <a href={`https://map.google.com/?q=${encodeURIComponent("전라북도 익산시 서동로 590")}`} target="_blank" rel="noopener noreferrer">
                {t.contact.mapOpen} ↗
              </a>
            </div>
            <div className={styles.mapArt}>
              <iframe
                className={styles.mapFrame}
                title="ETCOMPANY location"
                src={`https://www.google.com/maps?q=${encodeURIComponent("전라북도 익산시 서동로 590")}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={styles.locationsList}>
              <div className={styles.locationRow}>
                <div className={styles.locationIconBox}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.locationIcon}>
                    <path d="M3 21h18" />
                    <path d="M5 21V7l7-4 7 4v14" />
                    <path d="M9 21v-4h6v4" />
                    <path d="M9 10h1M14 10h1M9 14h1M14 14h1" />
                  </svg>
                </div>
                <div className={styles.locationInfo}>
                  <strong>{t.contact.hqTitle}</strong>
                  <span>{t.contact.hqAddress}</span>
                </div>
              </div>
              <div className={styles.locationRow}>
                <div className={styles.locationIconBox}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.locationIcon}>
                    <path d="M9 3h6M10 3v7.4L6.2 18.8A2 2 0 0 0 8 22h8a2 2 0 0 0 1.8-3.2L14 10.4V3" />
                    <path d="M8.5 17h7" />
                  </svg>
                </div>
                <div className={styles.locationInfo}>
                  <strong>{t.contact.labTitle}</strong>
                  <span>{t.contact.labAddress}</span>
                </div>
              </div>
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
            <div className={styles.faqGrid}>
              {faqs.map((faq, i) => (
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

          <div className={styles.channelsCol}>
            <div className={styles.colLabel} style={{ fontSize: 16 }}>
              {t.contact.infoSupportLabel}
            </div>
            <div className={styles.channelsGrid} style={{ marginTop: 16 }}>
              <div className={styles.channelCard}>
                <HeadsetIcon className={styles.channelIcon} />
                <div className={styles.channelLabel}>{t.contact.channelPhone}</div>
                <div className={styles.channelText}>{t.footer.tel}</div>
              </div>
              <div className={styles.channelCard}>
                <MailIcon className={styles.channelIcon} />
                <div className={styles.channelLabel}>E-mail</div>
                <div className={styles.channelText}>{t.footer.email}</div>
              </div>
              <a className={styles.channelCard} href="https://etmall.co.kr" target="_blank" rel="noopener noreferrer">
                <CartIcon className={styles.channelIcon} />
                <div className={styles.channelLabel}>{t.contact.channelShop}</div>
                <div className={styles.channelText}>ETMALL</div>
                <div className={styles.channelLink}>etmall.co.kr</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
