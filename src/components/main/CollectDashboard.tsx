"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";

type SensorConfig = {
  label: string;
  unit: string;
  color: string;
  base: number;
  min: number;
  max: number;
  decimals: number;
  format?: (v: number) => string;
};

const SENSORS: SensorConfig[] = [
  { label: "온도", unit: "℃", color: "#ef4444", base: 25.0, min: 23.5, max: 26.5, decimals: 1 },
  { label: "습도", unit: "%", color: "#3b82f6", base: 56.0, min: 50, max: 65, decimals: 1 },
  { label: "CO₂", unit: "ppm", color: "#8b5cf6", base: 709, min: 620, max: 800, decimals: 0 },
  { label: "조도", unit: "lux", color: "#f59e0b", base: 11566, min: 9000, max: 14000, decimals: 0, format: (v) => Math.round(v).toLocaleString() },
];

function ThermometerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      <line x1="11.5" y1="8" x2="11.5" y2="14" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function Co2Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 18.5a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.84 0A4.5 4.5 0 0 1 17.5 18.5H6.5z" />
      <text x="12" y="16" fill="#8b5cf6" stroke="none" fontSize="6" fontWeight="700" textAnchor="middle">CO₂</text>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

const SENSOR_ICONS = [ThermometerIcon, HumidityIcon, Co2Icon, SunIcon];

function randomWalk(prev: number, min: number, max: number, step: number) {
  return Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * step));
}

type DataRow = {
  time: string;
  values: number[];
};

function generateTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

export default function CollectDashboard() {
  const [sensorValues, setSensorValues] = useState(() => SENSORS.map((s) => s.base));
  const [prevValues, setPrevValues] = useState(() => SENSORS.map((s) => s.base));
  const [rows, setRows] = useState<DataRow[]>([]);
  const [trendData, setTrendData] = useState<number[][]>(() => {
    const data: number[][] = SENSORS.map(() => []);
    for (let i = 0; i < 24; i++) {
      SENSORS.forEach((s, si) => {
        const hour = i;
        let base = s.base;
        if (si === 0) base = s.base - 3 + Math.sin((hour / 24) * Math.PI * 2 - 1) * 3;
        if (si === 1) base = s.base + Math.cos((hour / 24) * Math.PI * 2) * 5;
        if (si === 2) base = s.base + Math.sin((hour / 24) * Math.PI) * 40;
        if (si === 3) base = hour >= 6 && hour <= 18 ? s.base + Math.sin(((hour - 6) / 12) * Math.PI) * 3000 : s.base * 0.3;
        data[si].push(Math.min(s.max, Math.max(s.min, base + (Math.random() - 0.5) * (s.max - s.min) * 0.1)));
      });
    }
    return data;
  });
  const [timePeriod, setTimePeriod] = useState("24시간");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const initial: DataRow[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5000);
      initial.push({
        time: `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`,
        values: SENSORS.map((s) => {
          const step = (s.max - s.min) * 0.15;
          return Math.min(s.max, Math.max(s.min, s.base + (Math.random() - 0.5) * step));
        }),
      });
    }
    setRows(initial);

    intervalRef.current = setInterval(() => {
      setSensorValues((prev) => {
        setPrevValues(prev);
        return prev.map((v, i) => {
          const s = SENSORS[i];
          return randomWalk(v, s.min, s.max, (s.max - s.min) * 0.08);
        });
      });
      setRows((prev) => {
        const newRow: DataRow = {
          time: generateTimeStr(),
          values: SENSORS.map((s, i) => {
            const step = (s.max - s.min) * 0.08;
            const last = prev[prev.length - 1]?.values[i] ?? s.base;
            return randomWalk(last, s.min, s.max, step);
          }),
        };
        const updated = [...prev, newRow];
        return updated.slice(-8);
      });
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const changes = sensorValues.map((v, i) => {
    const diff = v - prevValues[i];
    return { diff, up: diff >= 0 };
  });

  return (
    <div className={styles.collectWrap}>
      <div className={styles.sensorRow}>
        {SENSORS.map((s, i) => {
          const display = s.format ? s.format(sensorValues[i]) : sensorValues[i].toFixed(s.decimals);
          const ch = changes[i];
          const diffStr = s.format
            ? Math.abs(ch.diff).toFixed(0)
            : Math.abs(ch.diff).toFixed(s.decimals);
          const Icon = SENSOR_ICONS[i];
          return (
            <div className={styles.sensorCard} key={s.label}>
              <div className={styles.sensorHeader}>
                <span className={styles.sensorIconWrap} style={{ background: `${s.color}18` }}>
                  <Icon />
                </span>
                <span className={styles.sensorLabel}>{s.label}</span>
              </div>
              <div className={styles.sensorValue}>
                <strong>{display}</strong>
                <small>{s.unit}</small>
              </div>
              <div className={`${styles.sensorChange} ${ch.up ? styles.changeUp : styles.changeDown}`}>
                {ch.up ? "▲" : "▼"} {diffStr}{s.unit}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.collectBottom}>
        <div className={styles.recentTable}>
          <h3>최근 수집 데이터</h3>
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>시간</th>
                  <th>온도(℃)</th>
                  <th>습도(%)</th>
                  <th>CO₂(ppm)</th>
                  <th>조도(lux)</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(-6).reverse().map((row, ri) => (
                  <tr key={ri} className={ri === 0 ? styles.latestRow : ""}>
                    {[row.time, ...row.values.map((v, vi) =>
                      SENSORS[vi].format ? SENSORS[vi].format!(v) : v.toFixed(SENSORS[vi].decimals)
                    )].map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.trendChart}>
          <div className={styles.trendHeader}>
            <h3>수집 데이터 트렌드 ({timePeriod})</h3>
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option>24시간</option>
              <option>12시간</option>
              <option>1주일</option>
            </select>
          </div>
          <div className={styles.trendLegend}>
            {SENSORS.map((s) => (
              <span key={s.label}><i style={{ background: s.color }} />{s.label}({s.unit})</span>
            ))}
          </div>
          {(() => {
            const sliceStart = timePeriod === "12시간" ? 12 : 0;
            const visibleData = trendData.map((s) => s.slice(sliceStart));
            const labels = timePeriod === "12시간"
              ? ["12:00", "15:00", "18:00", "21:00", "24:00"]
              : timePeriod === "1주일"
                ? ["월", "화", "수", "목", "금"]
                : ["00:00", "06:00", "12:00", "18:00", "24:00"];
            return (
              <svg viewBox="0 0 600 200" className={styles.trendSvg}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="40" y1={20 + i * 40} x2="580" y2={20 + i * 40} stroke="#1e3a5f" strokeWidth="0.5" />
                ))}
                {labels.map((t, i) => (
                  <text key={t} x={40 + i * (540 / (labels.length - 1))} y="195" fill="#6b7f96" fontSize="10" textAnchor="middle">{t}</text>
                ))}
                {visibleData.map((series, si) => {
                  const s = SENSORS[si];
                  const rangeV = (s.max - s.min) || 1;
                  const pts = series.map((v, i) => {
                    const x = 40 + (i / (series.length - 1)) * 540;
                    const y = 20 + (1 - (v - s.min) / rangeV) * 160;
                    return `${x},${y}`;
                  });
                  return (
                    <polyline key={si} points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.85" />
                  );
                })}
                {[0, 20, 40, 60, 80].map((v, i) => (
                  <text key={`yl${i}`} x="35" y={180 - i * 40 + 4} fill="#6b7f96" fontSize="9" textAnchor="end">{v}</text>
                ))}
                {["0", "4K", "8K", "12K", "16K"].map((v, i) => (
                  <text key={`yr${i}`} x="585" y={180 - i * 40 + 4} fill="#6b7f96" fontSize="9" textAnchor="start">{v}</text>
                ))}
              </svg>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
