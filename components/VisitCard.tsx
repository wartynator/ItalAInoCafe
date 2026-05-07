"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingDots } from "./Rating";
import { TagChip } from "./TagChip";
import { Avatar } from "./Avatar";
import { Lightbox } from "./Lightbox";
import { formatDate, RATING_LABELS, placeAndCity } from "@/lib/format";

type Visit = {
  _id: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  userId?: string;
  userName?: string;
  userAvatarUrl?: string | null;
  overall: number;
  ratings: { environment: number; coffee: number; location: number } | null;
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
  const removeVisit = useMutation(api.visits.remove);
  const [deleting, setDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
    <article className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-5 md:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/cafes/${visit.cafeId}`}
            className="font-display text-xl leading-tight tracking-tight hover:underline underline-offset-4 md:text-2xl"
          >
            {visit.cafeName}
          </Link>
          <p className="mt-0.5 text-sm text-[var(--color-ink-soft)] truncate">
            {placeAndCity(visit.cafeAddress)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1">
            {canEdit && (
              <>
                <Link
                  href={`/visits/${visit._id}/edit`}
                  aria-label="Edit visit"
                  title="Edit"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-ink-soft)] hover:bg-[color:var(--color-bg)] hover:text-[var(--color-ink)]"
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
              </>
            )}
          </div>
          <RatingDots value={visit.overall || 0} size={16} />
        </div>
      </header>

      {visit.photoUrls.length > 0 && (
        <div
          className={
            "mt-4 grid gap-2 " +
            (visit.photoUrls.length === 1
              ? "grid-cols-1"
              : visit.photoUrls.length === 2
                ? "grid-cols-2"
                : "grid-cols-3")
          }
        >
          {visit.photoUrls.slice(0, 3).map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="aspect-[4/5] w-full object-cover transition-transform hover:scale-105"
              />
              {i === 2 && visit.photoUrls.length > 3 && (
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-medium text-white">
                  +{visit.photoUrls.length - 3}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {visit.notes && (
        <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line">
          {visit.notes}
        </p>
      )}

      {visit.ratings && (
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[color:var(--color-bg)]/60 p-3 text-xs">
          {(["environment", "coffee", "location"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1">
              <dt className="uppercase tracking-wider text-[var(--color-ink-soft)]">
                {k === "coffee" ? "Coffee" : RATING_LABELS[k]}
              </dt>
              <dd>
                <RatingDots value={visit.ratings![k]} size={12} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {visit.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visit.tags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between text-xs text-[var(--color-ink-soft)] tabular-nums">
        {showAuthor && visit.userName ? (
          <Link
            href={visit.userId ? `/u/${visit.userId}` : "#"}
            className="flex items-center gap-2 hover:text-[var(--color-ink)]"
          >
            <Avatar
              url={visit.userAvatarUrl}
              name={visit.userName}
              size={20}
              className="text-[10px]"
            />
            <span>{visit.userName}</span>
          </Link>
        ) : (
          <span />
        )}
        <span>{formatDate(visit.visitedAt)}</span>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          urls={visit.photoUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
