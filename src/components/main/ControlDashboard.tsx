"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

type Device = {
  icon: string;
  label: string;
  status: string;
  auto: boolean;
  detail: string;
};

const INITIAL_DEVICES: Device[] = [
  { icon: "💨", label: "환기 팬", status: "ON", auto: true, detail: "풍속 70%" },
  { icon: "💡", label: "LED 조명", status: "OFF", auto: false, detail: "밝기 0%" },
  { icon: "💧", label: "양액 펌프", status: "AUTO", auto: true, detail: "주기 15분 / 10초" },
  { icon: "❄", label: "냉난방기", status: "AUTO", auto: true, detail: "설정 24.0℃" },
  { icon: "🪟", label: "창문 개폐기", status: "CLOSE", auto: true, detail: "닫힘" },
  { icon: "🌫", label: "CO₂ 발생기", status: "OFF", auto: false, detail: "CO₂ 800ppm" },
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

  const normalCount = devices.filter((d) => d.status !== "OFF" || d.auto).length;
  const runningCount = devices.filter((d) => d.status === "ON" || d.status === "AUTO").length;
  const waitingCount = devices.filter((d) => d.status === "CLOSE").length;
  const stoppedCount = devices.filter((d) => d.status === "OFF" && !d.auto).length;

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

  const toggleDevice = (index: number) => {
    setDevices((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      const newStatus = d.status === "ON" ? "OFF" : d.status === "OFF" ? "ON" : d.status;
      return { ...d, status: newStatus };
    }));
  };

  const toggleAuto = (index: number) => {
    setDevices((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      return { ...d, auto: !d.auto };
    }));
  };

  const statusColor = (s: string) => {
    if (s === "ON") return "#3b82f6";
    if (s === "AUTO") return "#f59e0b";
    if (s === "CLOSE") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div className={styles.controlWrap}>
      <div className={styles.controlTopRow}>
        <div className={styles.devicePanel}>
          <div className={styles.deviceHeader}>
            <h3>자동 제어 상태</h3>
            <div className={styles.modeSelect}>
              <select value={controlMode} onChange={(e) => setControlMode(e.target.value)}>
                <option>자동 모드</option>
                <option>수동 모드</option>
              </select>
              <button className={styles.settingsBtn}>전체 제어 설정</button>
            </div>
          </div>
          <div className={styles.deviceGrid}>
            {devices.map((d, i) => (
              <div className={styles.deviceCard} key={i}>
                <div className={styles.deviceIcon}>{d.icon}</div>
                <div className={styles.deviceLabel}>{d.label}</div>
                <div className={styles.deviceStatus} style={{ color: statusColor(d.status) }}>{d.status}</div>
                <div className={styles.deviceToggleRow}>
                  <span>{d.auto ? "자동 모드" : "수동 모드"}</span>
                  <button
                    className={`${styles.toggle} ${d.auto ? styles.toggleOn : ""}`}
                    onClick={() => toggleAuto(i)}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
                <div className={styles.deviceDetail}>{d.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.controlBottomRow}>
        <div className={styles.targetCard}>
          <h3>환경 목표 설정</h3>
          <div className={styles.targetGrid}>
            <div className={styles.targetItem}>
              <span>목표 온도</span>
              <strong>{targetTemp.toFixed(1)}<small>℃</small></strong>
              <input type="range" min="10" max="40" step="0.5" value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>10℃</span><span>40℃</span></div>
            </div>
            <div className={styles.targetItem}>
              <span>목표 습도</span>
              <strong>{targetHumidity}<small>%</small></strong>
              <input type="range" min="20" max="90" step="1" value={targetHumidity}
                onChange={(e) => setTargetHumidity(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>20%</span><span>90%</span></div>
            </div>
            <div className={styles.targetItem}>
              <span>목표 CO₂</span>
              <strong>{targetCo2}<small>ppm</small></strong>
              <input type="range" min="400" max="1500" step="10" value={targetCo2}
                onChange={(e) => setTargetCo2(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>400</span><span>1500</span></div>
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h3>제어 요약</h3>
          <div className={styles.summaryContent}>
            <svg viewBox="0 0 120 120" className={styles.donut}>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#1e3a5f" strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#3b82f6" strokeWidth="10"
                strokeDasharray={`${(normalCount / devices.length) * 283} 283`}
                transform="rotate(-90 60 60)" />
              <text x="60" y="52" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{normalCount}</text>
              <text x="60" y="62" textAnchor="middle" fill="#8293a7" fontSize="8">/{devices.length}</text>
              <text x="60" y="78" textAnchor="middle" fill="#8293a7" fontSize="9">정상 작동</text>
            </svg>
            <div className={styles.summaryLegend}>
              <div><span className={styles.dotGreen} />정상<b>{normalCount}</b></div>
              <div><span className={styles.dotBlue} />작동 중<b>{runningCount}</b></div>
              <div><span className={styles.dotYellow} />대기 중<b>{waitingCount}</b></div>
              <div><span className={styles.dotRed} />정지<b>{stoppedCount}</b></div>
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
