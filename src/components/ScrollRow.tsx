"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ScrollRow.module.css";

type ScrollRowProps = {
  /** Class applied to the actual scrolling element (e.g. styles.tabs). */
  className?: string;
  /** Render the scroll element as this tag. Defaults to "div". */
  as?: "div" | "aside";
  children: React.ReactNode;
};

/**
 * Horizontal scroll container with:
 *  - mouse drag-to-scroll (click and drag with the pointer),
 *  - native touch scrolling,
 *  - "‹" / "›" chevron hints that appear only when the content actually
 *    overflows and point to the direction(s) still scrollable.
 *
 * The hints are driven by real overflow measurement, so they never show on
 * desktop layouts where the row wraps or stacks and there is nothing to scroll.
 */
export function ScrollRow({ className, as = "div", children }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  // Mouse drag-to-scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (e: MouseEvent) => {
      down = true;
      moved = false;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add(styles.dragging);
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove(styles.dragging);
    };
    // Prevent a drag from also triggering button clicks inside the row.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const Tag = as;
  return (
    <div className={styles.wrap}>
      <Tag ref={ref as never} className={className}>
        {children}
      </Tag>
      <span
        aria-hidden="true"
        className={`${styles.hint} ${styles.left} ${canLeft ? styles.show : ""}`}
      >
        ‹
      </span>
      <span
        aria-hidden="true"
        className={`${styles.hint} ${styles.right} ${canRight ? styles.show : ""}`}
      >
        ›
      </span>
    </div>
  );
}
