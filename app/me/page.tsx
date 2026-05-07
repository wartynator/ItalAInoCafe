"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";
import { formatRating } from "@/lib/format";

export default function MePage() {
  return (
    <>
      <Unauthenticated>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
          <h1 className="font-display text-2xl tracking-tight">Sign in to see your visits</h1>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-bg)]"
          >
            Sign in
          </Link>
        </div>
      </Unauthenticated>
      <Authenticated>
        <Mine />
      </Authenticated>
    </>
  );
}

function Mine() {
  const me = useQuery(api.users.me);
  const visits = useQuery(api.visits.myFeed);

  const stats = (() => {
    if (!visits || visits.length === 0) return null;
    const overalls = visits.map(
      (v) => (v.ratings.environment + v.ratings.coffee + v.ratings.location) / 3,
    );
    const avg = overalls.reduce((a, b) => a + b, 0) / overalls.length;
    return { count: visits.length, avg };
  })();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          {me?.name ?? me?.email ?? "You"}
        </h1>
        {stats ? (
          <p className="mt-2 text-[var(--color-ink-soft)]">
            <span className="tabular-nums">{stats.count}</span>{" "}
            {stats.count === 1 ? "visit" : "visits"} · average{" "}
            <span className="tabular-nums">{formatRating(stats.avg)}</span>
          </p>
        ) : (
          <p className="mt-2 text-[var(--color-ink-soft)]">No visits yet.</p>
        )}
      </header>

      {visits && visits.length === 0 && (
        <EmptyState
          title="Your log is empty."
          body="Add your first café — it doesn't have to be perfect, just real."
          ctaHref="/new"
          ctaLabel="Log a visit"
        />
      )}

      <div className="grid gap-5">
        {visits?.map((v) => (
          <VisitCard
            key={v._id}
            showAuthor={false}
            visit={{
              ...v,
              userName: me?.name ?? me?.email ?? "You",
            }}
          />
        ))}
      </div>
    </div>
  );
}
