"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  const feed = useQuery(api.visits.friendsFeed, { limit: 30 });
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
          title="Nothing brewing yet."
          body="Log your first coffee, or find friends to follow on the People page."
          ctaHref="/new"
          ctaLabel="New coffee"
        />
      )}
      {feed && feed.length > 0 && (
        <p className="text-xs text-[var(--color-ink-soft)]">
          Showing visits from you and people you follow.{" "}
          <Link href="/people" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
            Find more friends →
          </Link>
        </p>
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
          className="h-48 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]"
        />
      ))}
    </div>
  );
}
