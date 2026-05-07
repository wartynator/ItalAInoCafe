"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingDots } from "@/components/Rating";
import { VisitCard } from "@/components/VisitCard";
import { Lightbox } from "@/components/Lightbox";
import { formatRating, RATING_LABELS, cityFromAddress } from "@/lib/format";

export default function CafePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cafe = useQuery(api.cafes.get, { id: id as Id<"cafes"> });
  const me = useQuery(api.users.me);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (cafe === undefined) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]" />
    );
  }
  if (cafe === null) {
    return <p className="text-[var(--color-ink-soft)]">Café not found.</p>;
  }

  const city = cityFromAddress(cafe.address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`;

  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <header>
        <Link
          href="/cafes"
          className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          ← All cafés
        </Link>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          {cafe.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {city || cafe.address}
          <span className="mx-2">·</span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-ink)]"
          >
            Open in maps
          </a>
        </p>

        <Link
          href="/new"
          className="btn-primary mt-4 inline-flex items-center rounded-full px-5 py-2.5 text-sm"
        >
          Log another visit
        </Link>
      </header>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Overall
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-4xl tabular-nums">
                {formatRating(cafe.averages.overall)}
              </span>
              <RatingDots value={cafe.averages.overall} size={16} />
            </div>
          </div>
          <div className="text-right text-sm text-[var(--color-ink-soft)] tabular-nums">
            {cafe.visitCount} {cafe.visitCount === 1 ? "visit" : "visits"}
          </div>
        </div>

        {cafe.averages.hasFacets && (
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--color-line)] pt-5">
            {(["environment", "coffee", "location"] as const).map((k) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
                  {RATING_LABELS[k]}
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <RatingDots value={cafe.averages[k]} />
                  <span className="text-xs text-[var(--color-ink-soft)] tabular-nums">
                    {formatRating(cafe.averages[k])}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {cafe.photoWall.length > 0 && (
        <section>
          <h2 className="font-display text-xl tracking-tight">Photos</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {cafe.photoWall.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full object-cover transition-transform hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {cafe.tagCloud.length > 0 && (
        <section>
          <h2 className="font-display text-xl tracking-tight">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cafe.tagCloud.map(({ tag, count }) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-clay)]/30 bg-[var(--color-clay-soft)]/40 px-2.5 py-1 text-xs"
                style={{ fontSize: 11 + Math.min(4, count) }}
              >
                {tag}
                <span className="text-[var(--color-ink-soft)] tabular-nums">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl tracking-tight">Visits</h2>
        <div className="grid gap-5">
          {cafe.visits.map((v) => (
            <VisitCard
              key={v._id}
              canEdit={!!me && me._id === v.userId}
              visit={{
                _id: v._id,
                cafeId: cafe._id,
                cafeName: cafe.name,
                cafeAddress: cafe.address,
                userId: v.userId,
                userName: v.userName,
                userAvatarUrl: v.userAvatarUrl,
                overall: v.overall,
                ratings: v.ratings,
                notes: v.notes,
                tags: v.tags,
                photoUrls: v.photoUrls,
                visitedAt: v.visitedAt,
              }}
            />
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          urls={cafe.photoWall}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

