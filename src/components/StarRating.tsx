"use client";

import { useId, useState } from "react";

function Star({ filled, half }: { filled: boolean; half?: boolean }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <defs>
        {half && (
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      <path
        d="M12 2.5l2.95 6.28 6.75.66-5.1 4.62 1.47 6.7L12 17.63l-6.07 3.13 1.47-6.7-5.1-4.62 6.75-.66L12 2.5z"
        fill={half ? `url(#${gradientId})` : filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only star display for an average rating (supports halves). */
export function StarRatingDisplay({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={className} style={{ display: "inline-flex", gap: 1, color: "#f5a623", fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;
        return <Star key={star} filled={filled} half={half} />;
      })}
    </span>
  );
}

/** Interactive 1-5 star picker for submitting a review. */
export function StarRatingInput({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <span style={{ display: "inline-flex", gap: 2, color: "#f5a623", fontSize: size }} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          aria-label={`${star}점`}
          style={{ background: "none", border: 0, padding: 2, cursor: "pointer", lineHeight: 0, color: "inherit" }}
        >
          <Star filled={display >= star} />
        </button>
      ))}
    </span>
  );
}
