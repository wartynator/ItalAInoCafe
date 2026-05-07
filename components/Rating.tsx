"use client";

import { useId } from "react";

function Bean({
  size,
  filled,
  className,
}: {
  size: number;
  filled: boolean;
  className?: string;
}) {
  const fill = filled ? "var(--color-star)" : "transparent";
  const stroke = filled ? "var(--color-star)" : "var(--color-ink-soft)";
  const seam = filled ? "var(--color-bg)" : "var(--color-ink-soft)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <g transform="rotate(28 12 12)">
        <ellipse
          cx="12"
          cy="12"
          rx="6.2"
          ry="9.4"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.8"
        />
        <path
          d="M12 3.5 C 9.5 8, 9.5 16, 12 20.5"
          stroke={seam}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function RatingDots({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = Math.max(0, Math.min(1, value - (i - 1)));
        if (filled === 1) return <Bean key={i} size={size} filled />;
        if (filled === 0) return <Bean key={i} size={size} filled={false} />;
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Bean size={size} filled={false} className="absolute inset-0" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${filled * 100}%`, height: size }}
            >
              <Bean size={size} filled />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm text-[var(--color-ink-soft)]">
        {label}
      </label>
      <div
        id={id}
        role="radiogroup"
        aria-label={label}
        className="flex items-center gap-1.5"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(1, value - 1));
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(5, value + 1));
          }
        }}
        tabIndex={0}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= value;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={value === i}
              aria-label={`${i} out of 5`}
              onClick={() => onChange(i)}
              className="rounded-full p-0.5 transition-transform hover:scale-110"
            >
              <Bean size={20} filled={active} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
