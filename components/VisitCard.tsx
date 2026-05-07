"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingDots } from "./Rating";
import { TagChip } from "./TagChip";
import { formatDate, RATING_LABELS, shortAddress } from "@/lib/format";

type Visit = {
  _id: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  userName?: string;
  ratings: { environment: number; coffee: number; location: number };
  notes: string;
  tags: string[];
  photoUrls: string[];
  visitedAt: number;
};

export function VisitCard({
  visit,
  showAuthor = true,
  canEdit = false,
}: {
  visit: Visit;
  showAuthor?: boolean;
  canEdit?: boolean;
}) {
  const overall =
    (visit.ratings.environment + visit.ratings.coffee + visit.ratings.location) / 3;
  const removeVisit = useMutation(api.visits.remove);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (deleting) return;
    if (!confirm("Delete this visit? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await removeVisit({ id: visit._id as Id<"visits"> });
    } catch (err) {
      setDeleting(false);
      alert(err instanceof Error ? err.message : "Could not delete visit.");
    }
  }

  return (
    <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/cafes/${visit.cafeId}`}
            className="font-display text-2xl leading-tight tracking-tight hover:underline underline-offset-4"
          >
            {visit.cafeName}
          </Link>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1 truncate">
            {shortAddress(visit.cafeAddress)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {canEdit && (
              <div className="flex items-center gap-1">
                <Link
                  href={`/visits/${visit._id}/edit`}
                  aria-label="Edit visit"
                  title="Edit"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                >
                  <PencilIcon />
                </Link>
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  aria-label="Delete visit"
                  title="Delete"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-clay)]/15 hover:text-[var(--color-clay)] disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
            <RatingDots value={overall} />
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] tabular-nums">
            {formatDate(visit.visitedAt)}
            {showAuthor && visit.userName ? ` · ${visit.userName}` : ""}
          </p>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["environment", "coffee", "location"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              {RATING_LABELS[k]}
            </dt>
            <dd>
              <RatingDots value={visit.ratings[k]} />
            </dd>
          </div>
        ))}
      </dl>

      {visit.photoUrls.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visit.photoUrls.slice(0, 3).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      {visit.notes && (
        <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-ink)] whitespace-pre-line">
          {visit.notes}
        </p>
      )}

      {visit.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visit.tags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}
    </article>
  );
}

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
