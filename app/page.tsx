"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  const feed = useQuery(api.visits.recentFeed, { limit: 30 });

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            A quiet log of good coffee.
          </h1>
          <p className="mt-2 max-w-prose text-[var(--color-ink-soft)]">
            Recent visits from you and your friends — environment, coffee, location.
          </p>
        </div>
        <Link
          href="/new"
          className="hidden md:inline-flex shrink-0 items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-bg)] hover:opacity-90"
        >
          Log a visit
        </Link>
      </section>

      {feed === undefined && <FeedSkeleton />}
      {feed && feed.length === 0 && (
        <EmptyState
          title="No visits yet."
          body="Start by logging your last café — even three taps is enough."
          ctaHref="/new"
          ctaLabel="Log a visit"
        />
      )}

      <div className="grid gap-5">
        {feed?.map((v) => (
          <VisitCard key={v._id} visit={v} />
        ))}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}

