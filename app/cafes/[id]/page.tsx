"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingDots } from "@/components/Rating";
import { VisitCard } from "@/components/VisitCard";
import { TagChip } from "@/components/TagChip";
import { formatRating, RATING_LABELS } from "@/lib/format";

export default function CafePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cafe = useQuery(api.cafes.get, { id: id as Id<"cafes"> });
  const me = useQuery(api.users.me);

  if (cafe === undefined) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]" />
    );
  }
  if (cafe === null) {
    return <p className="text-[var(--color-ink-soft)]">Café not found.</p>;
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <header>
        <Link
          href="/cafes"
          className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          ← All cafés
        </Link>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">{cafe.name}</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">{cafe.address}</p>
      </header>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">Overall</p>
            <p className="mt-1 font-display text-3xl tabular-nums">
              {formatRating(cafe.averages.overall)}
            </p>
          </div>
          <div className="text-right text-sm text-[var(--color-ink-soft)] tabular-nums">
            {cafe.visitCount} {cafe.visitCount === 1 ? "visit" : "visits"}
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4">
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
        {cafe.topTags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {cafe.topTags.map((t) => (
              <TagChip key={t}>{t}</TagChip>
            ))}
          </div>
        )}
      </section>

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
                userName: v.userName,
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
    </div>
  );
}
