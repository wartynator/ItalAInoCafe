"use client";

import { useId } from "react";

export function RatingDots({
  value,
  size = 8,
}: {
  value: number;
  size?: number;
}) {
  // value can be fractional (averages); show 5 dots, fill proportional
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background:
                filled === 1
                  ? "var(--color-star)"
                  : filled === 0
                    ? "var(--color-line)"
                    : `linear-gradient(90deg, var(--color-star) ${filled * 100}%, var(--color-line) ${filled * 100}%)`,
            }}
          />
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
        className="flex items-center gap-2"
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
              className="rounded-full transition-transform hover:scale-110"
              style={{
                width: 14,
                height: 14,
                background: active ? "var(--color-star)" : "transparent",
                border: `1px solid ${active ? "var(--color-star)" : "var(--color-line)"}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
