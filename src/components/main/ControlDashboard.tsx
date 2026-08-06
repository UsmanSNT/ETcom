"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./dashboard.module.css";

type Device = {
  icon: ReactNode;
  label: string;
  status: string;
  auto: boolean;
  detail: string;
};

function FanIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12c4-1 7-4 7-7 0 5 4 9 9 5 0-5-2.5-8-6-8z" />
      <path d="M12 22c5.5 0 10-4.5 10-10-4 1-7 4-7 7 0-5-4-9-9-5 0 5 2.5 8 6 8z" />
    </svg>
  );
}

function LedIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    </svg>
  );
}

function PumpIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function HvacIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h10" /><path d="M12 2v10" />
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
      <path d="M8 16l-3.2 3.2" /><path d="M14 16l3 3" />
    </svg>
  );
}

function WindowIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
      <path d="M7 7l2 2" /><path d="M15 7l2 2" />
    </svg>
  );
}

function Co2GenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 18.5a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.84 0A4.5 4.5 0 0 1 17.5 18.5H6.5z" />
    </svg>
  );
}

const INITIAL_DEVICES: Device[] = [
  { icon: <FanIcon />, label: "환기 팬", status: "AUTO", auto: true, detail: "풍속 70%" },
  { icon: <LedIcon />, label: "LED 조명", status: "OFF", auto: true, detail: "밝기 0%" },
  { icon: <PumpIcon />, label: "양액 펌프", status: "AUTO", auto: true, detail: "주기 15분 / 10초" },
  { icon: <HvacIcon />, label: "냉난방기", status: "AUTO", auto: true, detail: "설정 24.0℃" },
  { icon: <WindowIcon />, label: "창문 개폐기", status: "OFF", auto: true, detail: "닫힘" },
  { icon: <Co2GenIcon />, label: "CO₂ 발생기", status: "OFF", auto: true, detail: "CO₂ 800ppm" },
];

function randomWalk(prev: number, min: number, max: number, step: number) {
  return Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * step));
}

export default function ControlDashboard() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [controlMode, setControlMode] = useState("자동 모드");
  const [targetTemp, setTargetTemp] = useState(24.0);
  const [targetHumidity, setTargetHumidity] = useState(55);
  const [targetCo2, setTargetCo2] = useState(800);

  const [stats, setStats] = useState({
    autoRuns: 28,
    manualRuns: 3,
    successRate: 96.4,
    energySaved: 12.6,
  });

  const normalCount = devices.filter((d) => d.status === "AUTO").length;
  const runningCount = devices.filter((d) => d.status === "ON").length;
  const waitingCount = devices.filter((d) => d.status === "CLOSE").length;
  const stoppedCount = devices.filter((d) => d.status === "OFF").length;

  useEffect(() => {
    const id = setInterval(() => {
      setStats((prev) => ({
        autoRuns: prev.autoRuns + (Math.random() > 0.7 ? 1 : 0),
        manualRuns: prev.manualRuns + (Math.random() > 0.9 ? 1 : 0),
        successRate: randomWalk(prev.successRate, 94, 99, 0.5),
        energySaved: randomWalk(prev.energySaved, 10, 16, 0.3),
      }));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleDevice = (index: number) => {
    setDevices((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      const on = d.status === "OFF";
      return { ...d, status: on ? "AUTO" : "OFF", auto: on };
    }));
  };

  const toggleAuto = (index: number) => {
    setDevices((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      const newAuto = !d.auto;
      return { ...d, auto: newAuto, status: newAuto ? "AUTO" : "OFF" };
    }));
  };

  const applyControlMode = (mode: string) => {
    setControlMode(mode);
    const isAuto = mode === "자동 모드";
    setDevices((prev) => prev.map((d) => ({
      ...d,
      auto: isAuto,
      status: isAuto ? "AUTO" : "OFF",
    })));
  };

  const statusColor = (s: string) => {
    if (s === "AUTO") return "#22c55e";
    return "#6b7280";
  };

  return (
    <div className={styles.controlWrap}>
      <div className={styles.controlTopRow}>
        <div className={styles.devicePanel}>
          <div className={styles.deviceHeader}>
            <h3>자동 제어 상태</h3>
            <div className={styles.modeSelect}>
              <select value={controlMode} onChange={(e) => applyControlMode(e.target.value)}>
                <option>자동 모드</option>
                <option>수동 모드</option>
              </select>
              <button className={styles.settingsBtn} onClick={() => setSettingsOpen((v) => !v)}>전체 제어 설정</button>
            </div>
          </div>
          <div className={styles.deviceGrid}>
            {devices.map((d, i) => (
              <div className={styles.deviceCard} key={i}>
                <div className={styles.deviceIconWrap}>{d.icon}</div>
                <div className={styles.deviceLabel}>{d.label}</div>
                <button
                  className={`${styles.deviceToggleBtn} ${d.auto ? styles.deviceToggleBtnAuto : styles.deviceToggleBtnOff}`}
                  onClick={() => toggleAuto(i)}
                >
                  {d.auto ? "AUTO" : "OFF"}
                </button>
                <div className={styles.deviceModeLabel}>{d.auto ? "자동 모드" : "수동 모드"}</div>
                <div className={styles.deviceDetail}>{d.detail}</div>
              </div>
            ))}
          </div>
          {settingsOpen && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsPanelHeader}>
                <h4>전체 제어 설정</h4>
                <button onClick={() => setSettingsOpen(false)}>×</button>
              </div>
              <div className={styles.settingsPanelBody}>
                <div className={styles.settingsRow}>
                  <span>제어 모드</span>
                  <select value={controlMode} onChange={(e) => applyControlMode(e.target.value)}>
                    <option>자동 모드</option>
                    <option>수동 모드</option>
                  </select>
                </div>
                <div className={styles.settingsRow}>
                  <span>데이터 수집 주기</span>
                  <select defaultValue="5초"><option>1초</option><option>5초</option><option>10초</option><option>30초</option></select>
                </div>
                <div className={styles.settingsRow}>
                  <span>이상 알림</span>
                  <select defaultValue="활성화"><option>활성화</option><option>비활성화</option></select>
                </div>
                <button className={styles.outlineBtn} onClick={() => setSettingsOpen(false)}>설정 저장</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.controlBottomRow}>
        <div className={styles.targetCard}>
          <div className={styles.targetList}>
            <div className={styles.targetRow}>
              <span className={styles.targetRowIcon} style={{ background: "rgba(59,130,246,.18)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
              </span>
              <div className={styles.targetRowBody}>
                <span className={styles.targetRowLabel}>목표 온도</span>
                <div className={styles.targetRowSliderLine}>
                  <strong className={styles.targetRowValue}>{targetTemp.toFixed(1)}<small>°C</small></strong>
                  <div className={styles.targetRowSliderWrap}>
                    <input className={styles.targetRange} style={{ "--range-color": "#3b82f6" } as React.CSSProperties} type="range" min="10" max="40" step="0.5" value={targetTemp} onChange={(e) => setTargetTemp(Number(e.target.value))} />
                    <div className={styles.rangeLabels}><span>10°C</span><span>40°C</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.targetRow}>
              <span className={styles.targetRowIcon} style={{ background: "rgba(34,197,94,.18)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </span>
              <div className={styles.targetRowBody}>
                <span className={styles.targetRowLabel}>목표 습도</span>
                <div className={styles.targetRowSliderLine}>
                  <strong className={styles.targetRowValue}>{targetHumidity}<small>%</small></strong>
                  <div className={styles.targetRowSliderWrap}>
                    <input className={styles.targetRange} style={{ "--range-color": "#22c55e" } as React.CSSProperties} type="range" min="20" max="90" step="1" value={targetHumidity} onChange={(e) => setTargetHumidity(Number(e.target.value))} />
                    <div className={styles.rangeLabels}><span>20%</span><span>90%</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.targetRow}>
              <span className={styles.targetRowIcon} style={{ background: "rgba(168,85,247,.18)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 18.5a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.84 0A4.5 4.5 0 0 1 17.5 18.5H6.5z"/><text x="12" y="16" fill="#a855f7" stroke="none" fontSize="5.5" fontWeight="700" textAnchor="middle">CO₂</text></svg>
              </span>
              <div className={styles.targetRowBody}>
                <span className={styles.targetRowLabel}>목표 CO₂</span>
                <div className={styles.targetRowSliderLine}>
                  <strong className={styles.targetRowValue}>{targetCo2}<small>ppm</small></strong>
                  <div className={styles.targetRowSliderWrap}>
                    <input className={styles.targetRange} style={{ "--range-color": "#a855f7" } as React.CSSProperties} type="range" min="400" max="1500" step="10" value={targetCo2} onChange={(e) => setTargetCo2(Number(e.target.value))} />
                    <div className={styles.rangeLabels}><span>400</span><span>1500</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h3>제어 요약</h3>
          <div className={styles.summaryContentV}>
            {(() => {
              const r = 45;
              const circ = 2 * Math.PI * r;
              const total = devices.length;
              const segments = [
                { value: normalCount, color: "#22c55e" },
                { value: runningCount, color: "#3b82f6" },
                { value: waitingCount, color: "#facc15" },
                { value: stoppedCount, color: "#ef4444" },
              ];
              let offset = 0;
              return (
                <svg viewBox="0 0 120 120" className={styles.donutLg}>
                  <circle cx="60" cy="60" r={r} fill="none" stroke="#1e3a5f" strokeWidth="10" />
                  {segments.map((seg, i) => {
                    const dash = (seg.value / total) * circ;
                    const el = (
                      <circle key={i} cx="60" cy="60" r={r} fill="none"
                        stroke={seg.color} strokeWidth="10"
                        strokeDasharray={`${dash} ${circ}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 60 60)" />
                    );
                    offset += dash;
                    return el;
                  })}
                  <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{normalCount}</text>
                  <text x="60" y="67" textAnchor="middle" fill="#8293a7" fontSize="9">/{total} 정상</text>
                </svg>
              );
            })()}
            <div className={styles.summaryLegendH}>
              <div><span className={styles.dotGreen} />정상 <b>{normalCount}</b></div>
              <div><span className={styles.dotBlue} />작동 <b>{runningCount}</b></div>
              <div><span className={styles.dotYellow} />대기 <b>{waitingCount}</b></div>
              <div><span className={styles.dotRed} />정지 <b>{stoppedCount}</b></div>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3>오늘 제어 통계</h3>
          <div className={styles.statsGrid}>
            <div><span>자동 제어 실행</span><b>{stats.autoRuns} 건</b></div>
            <div><span>수동 제어 실행</span><b>{stats.manualRuns} 건</b></div>
            <div><span>제어 성공률</span><b>{stats.successRate.toFixed(1)} %</b></div>
            <div><span>에너지 절감량</span><b>{stats.energySaved.toFixed(1)} kWh</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
