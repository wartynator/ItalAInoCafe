"use client";

import Link from "next/link";
import { RatingDots } from "./Rating";
import { TagChip } from "./TagChip";
import { formatRating, shortAddress } from "@/lib/format";

type CafeSummary = {
  _id: string;
  name: string;
  address: string;
  visitCount: number;
  averages: { environment: number; coffee: number; location: number; overall: number };
  topTags: string[];
};

export function CafeCard({
  cafe,
  onSelect,
  active = false,
}: {
  cafe: CafeSummary;
  onSelect?: (id: string) => void;
  active?: boolean;
}) {
  const ringClass = active
    ? "border-[var(--color-clay)] ring-1 ring-[var(--color-clay)]/40"
    : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]";

  const Inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight tracking-tight truncate">
            {cafe.name}
          </h3>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1 truncate">
            {shortAddress(cafe.address)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex justify-end">
            <RatingDots value={cafe.averages.overall} />
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] mt-1 tabular-nums">
            {formatRating(cafe.averages.overall)} · {cafe.visitCount}{" "}
            {cafe.visitCount === 1 ? "visit" : "visits"}
          </p>
        </div>
      </div>
      {cafe.topTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cafe.topTags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}
    </>
  );

  if (onSelect) {
    return (
      <div
        className={
          "relative block rounded-2xl border bg-[var(--color-surface)] p-6 transition-colors " +
          ringClass
        }
      >
        <button
          type="button"
          onClick={() => onSelect(cafe._id)}
          aria-label={`Show ${cafe.name} on map`}
          className="absolute inset-0 z-0 rounded-2xl"
        />
        <div className="relative z-10 pointer-events-none">{Inner}</div>
        <Link
          href={`/cafes/${cafe._id}`}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 mt-4 inline-flex text-xs text-[var(--color-clay)] underline underline-offset-2 hover:text-[var(--color-ink)]"
        >
          View visits →
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/cafes/${cafe._id}`}
      className={
        "block rounded-2xl border bg-[var(--color-surface)] p-6 transition-colors " +
        ringClass
      }
    >
      {Inner}
    </Link>
  );
}
