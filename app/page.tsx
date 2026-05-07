"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  const feed = useQuery(api.visits.recentFeed, { limit: 30 });
  const me = useQuery(api.users.me);

  return (
    <div className="space-y-8">
      <header className="pt-2">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Feed</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          Recent café visits from you and your friends.
        </p>
      </header>

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
          <VisitCard key={v._id} visit={v} canEdit={!!me && me._id === v.userId} />
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
