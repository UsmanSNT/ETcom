"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

function randomWalk(prev: number, min: number, max: number, step: number) {
  return Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * step));
}

const ANOMALY_INIT = { caution: 1, warning: 1, danger: 0, normal: 128 };

const INSIGHTS = [
  {
    title: "온도 상승 패턴 감지",
    desc: "온도 상승 속도가 평소보다 15% 빠릅니다.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    title: "CO₂ 농도 예측",
    desc: "3시간 내 CO₂ 농도 850ppm 초과가 예측됩니다.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 18.5a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.84 0A4.5 4.5 0 0 1 17.5 18.5H6.5z" />
      </svg>
    ),
  },
  {
    title: "생육 최적 구간",
    desc: "현재 환경은 작물 생육에 최적화된 상태입니다.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10" /><path d="M10 20c5.5-2.5 6-9.5 1-12.5C10.5 10 10 14 10 14s-2-3.5-1-7c-4 2-5 8-2 13" />
      </svg>
    ),
  },
];

const CONTROLS = [
  {
    label: "환기 팬 속도 조절", status: "자동", color: "#3b82f6",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m0-1a1 1 0 1 0 0 2 1 1 0 1 0 0-2" />
        <path d="M14.5 7.5a5 5 0 0 0-7 7l4.5 4.5a5 5 0 0 0 7-7L14.5 7.5z" />
        <path d="M9.5 16.5a5 5 0 0 0 7-7L12 5a5 5 0 0 0-7 7l4.5 4.5z" />
      </svg>
    ),
  },
  {
    label: "CO₂ 공급 케어", status: "권장", color: "#f59e0b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 18.5a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.84 0A4.5 4.5 0 0 1 17.5 18.5H6.5z" />
      </svg>
    ),
  },
  {
    label: "LED 밝기 조절", status: "권장", color: "#f59e0b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" /><path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
      </svg>
    ),
  },
  {
    label: "양액 온도 조절", status: "유지", color: "#22c55e",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
];

export default function AIAnalysisDashboard() {
  const [anomaly, setAnomaly] = useState(ANOMALY_INIT);
  const [timePeriod, setTimePeriod] = useState("24시간");
  const [modelPeriod, setModelPeriod] = useState("주간");
  const [showAnomalyDetail, setShowAnomalyDetail] = useState(false);
  const [controlApplied, setControlApplied] = useState(false);

  const [tempHistory] = useState(() => {
    const data: number[] = [];
    let v = 20;
    for (let i = 0; i < 24; i++) {
      v = randomWalk(v, 18, 28, 1.5);
      data.push(v);
    }
    return data;
  });

  const [predHistory] = useState(() => {
    const data: number[] = [];
    let v = 21;
    for (let i = 0; i < 24; i++) {
      v = randomWalk(v, 18, 28, 0.8);
      data.push(v);
    }
    return data;
  });

  const [accuracy, setAccuracy] = useState(93.6);

  useEffect(() => {
    const id = setInterval(() => {
      setAnomaly((prev) => ({
        caution: Math.max(0, prev.caution + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0)),
        warning: Math.max(0, prev.warning + (Math.random() > 0.8 ? 1 : Math.random() > 0.6 ? -1 : 0)),
        danger: Math.max(0, prev.danger + (Math.random() > 0.95 ? 1 : 0)),
        normal: 128 + Math.floor((Math.random() - 0.5) * 4),
      }));
      setAccuracy((p) => randomWalk(p, 91, 96, 0.3));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const total = anomaly.caution + anomaly.warning + anomaly.danger;
  const upperBound = 35;
  const lowerBound = 10;
  const currentTemp = tempHistory[tempHistory.length - 1];

  const radarLabels = ["온도 예측", "병해 예측", "습도 예측", "CO₂ 예측", "조도 예측"];
  const radarValues = modelPeriod === "월간" ? [0.92, 0.78, 0.94, 0.89, 0.83] : [0.88, 0.72, 0.91, 0.85, 0.78];
  const radarAngles = radarLabels.map((_, i) => (i / radarLabels.length) * Math.PI * 2 - Math.PI / 2);
  const radarR = 55;
  const cx = 90, cy = 75;

  return (
    <div className={styles.aiWrap}>
      <div className={styles.aiTopRow}>
        <div className={styles.anomalyCard}>
          <h3>AI 이상 탐지</h3>
          <div className={styles.anomalyContent}>
            <div className={styles.donutWrap}>
              {(() => {
                const r = 45;
                const circ = 2 * Math.PI * r;
                const grandTotal = anomaly.caution + anomaly.warning + anomaly.danger + anomaly.normal;
                const segments = [
                  { value: anomaly.caution, color: "#f97316" },
                  { value: anomaly.warning, color: "#facc15" },
                  { value: anomaly.danger, color: "#ef4444" },
                  { value: anomaly.normal, color: "#22c55e" },
                ];
                let offset = 0;
                return (
                  <svg viewBox="0 0 120 120" className={styles.donut}>
                    <circle cx="60" cy="60" r={r} fill="none" stroke="#1e3a5f" strokeWidth="12" />
                    {segments.map((seg, i) => {
                      const dash = (seg.value / grandTotal) * circ;
                      const el = (
                        <circle key={i} cx="60" cy="60" r={r} fill="none"
                          stroke={seg.color} strokeWidth="12"
                          strokeDasharray={`${dash} ${circ}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 60 60)" />
                      );
                      offset += dash;
                      return el;
                    })}
                    <text x="60" y="55" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{total}</text>
                    <text x="60" y="72" textAnchor="middle" fill="#8293a7" fontSize="10">건</text>
                    <text x="60" y="85" textAnchor="middle" fill="#8293a7" fontSize="9">이상 감지</text>
                  </svg>
                );
              })()}
            </div>
            <div className={styles.anomalyLegend}>
              <div><span className={styles.dotOrange} />주의<b>{anomaly.caution} 건</b></div>
              <div><span className={styles.dotYellow} />경고<b>{anomaly.warning} 건</b></div>
              <div><span className={styles.dotRed} />위험<b>{anomaly.danger} 건</b></div>
              <div><span className={styles.dotGreen} />정상<b>{anomaly.normal} 건</b></div>
            </div>
          </div>
          <button className={styles.outlineBtn} onClick={() => setShowAnomalyDetail((v) => !v)}>
            {showAnomalyDetail ? "닫기 ×" : "이상 내역 보기 →"}
          </button>
          {showAnomalyDetail && (
            <div className={styles.anomalyDetailPanel}>
              <div className={styles.anomalyDetailItem} style={{ borderLeft: "3px solid #f59e0b" }}>
                <strong>온도 상승 감지</strong>
                <span>14:32 | 온도 26.8℃ → 임계치 초과</span>
              </div>
              <div className={styles.anomalyDetailItem} style={{ borderLeft: "3px solid #ef4444" }}>
                <strong>CO₂ 급격한 변화</strong>
                <span>13:15 | CO₂ 890ppm → 비정상 패턴</span>
              </div>
              <div className={styles.anomalyDetailItem} style={{ borderLeft: "3px solid #f59e0b" }}>
                <strong>습도 하락 추세</strong>
                <span>11:48 | 습도 48% → 하한선 접근</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.predictionChart}>
          <div className={styles.trendHeader}>
            <h3>AI 예측 - 환경 변화 추이</h3>
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option>24시간</option>
              <option>12시간</option>
            </select>
          </div>
          <div className={styles.predLegend}>
            <span><i style={{ background: "#3b82f6" }} />실측 온도(℃)</span>
            <span><i style={{ background: "#22c55e", height: 2, borderTop: "1px dashed #22c55e" }} />AI 예측 온도(℃)</span>
            <span><i style={{ background: "transparent", borderTop: "1px dashed #ef4444", height: 2 }} />상한/하한선</span>
          </div>
          {(() => {
            const sliceStart = timePeriod === "12시간" ? 12 : 0;
            const visTemp = tempHistory.slice(sliceStart);
            const visPred = predHistory.slice(sliceStart);
            const len = visTemp.length;
            const labels = timePeriod === "12시간"
              ? ["12:00", "15:00", "18:00", "21:00", "24:00"]
              : ["00:00", "06:00", "12:00", "18:00", "24:00"];
            const visCurrentTemp = visTemp[visTemp.length - 1];
            return (
              <svg viewBox="0 0 600 180" className={styles.trendSvg}>
                <line x1="40" y1="20" x2="560" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
                <line x1="40" y1="155" x2="560" y2="155" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 3" opacity="0.4" />
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="40" y1={20 + i * 45} x2="560" y2={20 + i * 45} stroke="#1e3a5f" strokeWidth="0.3" />
                ))}
                <polyline
                  points={visTemp.map((v, i) => `${40 + (i / (len - 1)) * 520},${20 + ((upperBound - v) / (upperBound - lowerBound)) * 135}`).join(" ")}
                  fill="none" stroke="#3b82f6" strokeWidth="2"
                />
                {visTemp.map((v, i) => (
                  <circle key={i} cx={40 + (i / (len - 1)) * 520} cy={20 + ((upperBound - v) / (upperBound - lowerBound)) * 135}
                    r="3" fill="#3b82f6" />
                ))}
                <polyline
                  points={visPred.map((v, i) => `${40 + (i / (len - 1)) * 520},${20 + ((upperBound - v) / (upperBound - lowerBound)) * 135}`).join(" ")}
                  fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 3"
                />
                {labels.map((t, i) => (
                  <text key={t} x={40 + i * (520 / (labels.length - 1))} y="175" fill="#6b7f96" fontSize="10" textAnchor="middle">{t}</text>
                ))}
                {[10, 20, 30, 40].map((v, i) => (
                  <text key={v} x="35" y={155 - i * 45 + 4} fill="#6b7f96" fontSize="9" textAnchor="end">{v}</text>
                ))}
                <g>
                  <rect x="380" y={20 + ((upperBound - visCurrentTemp) / (upperBound - lowerBound)) * 135 - 14} width="90" height="20" rx="4" fill="#0f2742" stroke="#3b82f6" strokeWidth="0.5" />
                  <text x="425" y={20 + ((upperBound - visCurrentTemp) / (upperBound - lowerBound)) * 135} fill="white" fontSize="10" textAnchor="middle">
                    현재 {visCurrentTemp.toFixed(1)}°C
                  </text>
                </g>
              </svg>
            );
          })()}
        </div>
      </div>

      <div className={styles.aiBottomRow}>
        <div className={styles.insightCard}>
          <h3>AI 인사이트</h3>
          {INSIGHTS.map((ins, i) => (
            <div className={styles.insightItem} key={i}>
              <span className={styles.insightIconWrap}>{ins.icon}</span>
              <div>
                <strong>{ins.title}</strong>
                <p>{ins.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.controlRecommend}>
          <h3>AI 추천 제어</h3>
          {CONTROLS.map((c, i) => (
            <div className={styles.controlItem} key={i}>
              <span className={styles.controlIconWrap}>{c.icon}</span>
              <span className={styles.controlLabel}>{c.label}</span>
              <span className={styles.controlBadge} style={{ background: c.color }}>{c.status}</span>
            </div>
          ))}
          <button
            className={`${styles.outlineBtn} ${controlApplied ? styles.outlineBtnActive : ""}`}
            onClick={() => { setControlApplied(true); setTimeout(() => setControlApplied(false), 2000); }}
          >
            {controlApplied ? "✓ 적용 완료" : "제어 적용하기 →"}
          </button>
        </div>

        <div className={styles.modelPerf}>
          <div className={styles.trendHeader}>
            <h3>AI 모델 성능</h3>
            <select value={modelPeriod} onChange={(e) => setModelPeriod(e.target.value)}>
              <option>주간</option>
              <option>월간</option>
            </select>
          </div>
          <div className={styles.perfContent}>
            <div className={styles.perfStats}>
              <div>
                <span>예측 정확도</span>
                <strong>{accuracy.toFixed(1)} %</strong>
              </div>
              <div className={styles.perfMeta}>
                <div><span>학습 데이터</span><b>{modelPeriod === "월간" ? "542,180 건" : "128,560 건"}</b></div>
                <div><span>모델 버전</span><b>v2.3.7</b></div>
                <div><span>최근 학습일</span><b>{modelPeriod === "월간" ? "2026.07.01 08:30" : "2026.07.28 02:15"}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
