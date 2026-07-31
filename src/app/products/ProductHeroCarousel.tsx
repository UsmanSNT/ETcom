"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

type Slide = {
  image: string;
  titleKo: string;
  titleEn: string;
  bulletsKo: string[];
  bulletsEn: string[];
  taglineKo: string;
  taglineEn: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/product_bg-1.png",
    titleKo: "스마트 수직농장",
    titleEn: "Smart Vertical Farm",
    bulletsKo: ["자동 관수 시스템", "LED 생장 조명", "온도 및 습도 관리", "공간 절약형 설계", "깨끗하고 효율적인 재배"],
    bulletsEn: [
      "Automatic irrigation system",
      "LED grow lighting",
      "Temperature & humidity control",
      "Space-saving design",
      "Clean, efficient cultivation",
    ],
    taglineKo: "스마트 기술로 만드는 안정적인 생산 환경.",
    taglineEn: "A stable growing environment, built with smart technology.",
  },
  {
    image: "/images/product_bg-2.png",
    titleKo: "무선 제어 모듈",
    titleEn: "Wireless Control Module",
    bulletsKo: ["안정적인 무선 통신", "실시간 데이터 전송", "간편한 설치", "신뢰도 높은 연결", "스마트팜 및 산업 설비에 적용 가능"],
    bulletsEn: [
      "Stable wireless communication",
      "Real-time data transmission",
      "Easy installation",
      "High-reliability connectivity",
      "For smart farms & industrial equipment",
    ],
    taglineKo: "언제 어디서나 간편한 원격 관리.",
    taglineEn: "Simple remote management, anytime, anywhere.",
  },
  {
    image: "/images/product_bg-3.png",
    titleKo: "스마트 모니터링 장치",
    titleEn: "Smart Monitoring Device",
    bulletsKo: ["센서 데이터 표시", "Wi-Fi 연결", "직관적인 사용자 인터페이스", "실시간 상태 확인", "슬림하고 현대적인 디자인"],
    bulletsEn: [
      "Sensor data display",
      "Wi-Fi connectivity",
      "Intuitive user interface",
      "Real-time status checks",
      "Slim, modern design",
    ],
    taglineKo: "정확한 데이터로 더 나은 결정을 내리세요.",
    taglineEn: "Make better decisions with accurate data.",
  },
  {
    image: "/images/product_bg-4.png",
    titleKo: "자동 제어 보드",
    titleEn: "Auto Control Board",
    bulletsKo: ["센서 및 모터 제어", "다양한 장치 연결", "자동화 프로세스 구현", "안정적이고 빠른 작동", "로봇 및 스마트팜 프로젝트에 적용 가능"],
    bulletsEn: [
      "Sensor & motor control",
      "Connects to diverse devices",
      "Implements automated processes",
      "Stable, fast operation",
      "For robotics & smart farm projects",
    ],
    taglineKo: "강력한 제어 기능과 확장성.",
    taglineEn: "Powerful control, built to scale.",
  },
];

const AUTO_PLAY_MS = 5000;

export function ProductHeroCarousel() {
  const { locale, t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  function goTo(index: number) {
    setActive(index);
  }

  return (
    <section
      className={styles.heroCarousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          className={`${styles.heroSlide} ${index === active ? styles.heroSlideActive : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={index !== active}
        >
          <div className={styles.heroSlideScrim} />
          <div className={styles.heroInner}>
            <div className={styles.breadcrumb}>
              <span>HOME</span>
              <b aria-hidden="true">›</b>
              <span>Products</span>
              <b aria-hidden="true">›</b>
              <strong>{t.products.breadcrumb}</strong>
            </div>
            <h1 className={styles.title}>{locale === "ko" ? slide.titleKo : slide.titleEn}</h1>
            <ul className={styles.heroBullets}>
              {(locale === "ko" ? slide.bulletsKo : slide.bulletsEn).map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className={styles.desc}>{locale === "ko" ? slide.taglineKo : slide.taglineEn}</p>
          </div>
        </div>
      ))}

      <div className={styles.heroDots} role="tablist" aria-label="Slides">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`${index + 1}`}
            className={`${styles.heroDot} ${index === active ? styles.heroDotActive : ""}`}
            onClick={() => goTo(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
