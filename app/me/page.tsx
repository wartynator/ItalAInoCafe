"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";
import { formatRating } from "@/lib/format";

export default function MePage() {
  const me = useQuery(api.users.me);
  const visits = useQuery(api.visits.myFeed);
  const removeVisit = useMutation(api.visits.remove);
  const [pendingDelete, setPendingDelete] = useState<Id<"visits"> | null>(null);

  const stats = (() => {
    if (!visits || visits.length === 0) return null;
    const overalls = visits.map(
      (v) => (v.ratings.environment + v.ratings.coffee + v.ratings.location) / 3,
    );
    const avg = overalls.reduce((a, b) => a + b, 0) / overalls.length;
    const cafes = new Set(visits.map((v) => v.cafeId));
    return { count: visits.length, avg, cafes: cafes.size };
  })();

  const display = me?.name ?? me?.email ?? "You";
  const initial = (me?.name ?? me?.email ?? "?").trim().charAt(0).toUpperCase();

  async function onDelete(id: Id<"visits">) {
    if (!confirm("Delete this visit? This cannot be undone.")) return;
    setPendingDelete(id);
    try {
      await removeVisit({ id });
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-sage-soft)] font-display text-2xl">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              {display}
            </h1>
            {me?.email && (
              <p className="text-sm text-[var(--color-ink-soft)]">{me.email}</p>
            )}
          </div>
        </div>

        {stats && (
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--color-line)] pt-5">
            <Stat label="Visits" value={stats.count.toString()} />
            <Stat label="Cafés" value={stats.cafes.toString()} />
            <Stat label="Avg rating" value={formatRating(stats.avg)} />
          </dl>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-tight">Your visits</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Edit or remove anything you&apos;ve logged.
        </p>

        {visits === undefined && (
          <div className="mt-6 grid gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
              />
            ))}
          </div>
        )}

        {visits && visits.length === 0 && (
          <div className="mt-6">
            <EmptyState
              title="Your log is empty."
              body="Add your first café — it doesn't have to be perfect, just real."
              ctaHref="/new"
              ctaLabel="Log a visit"
            />
          </div>
        )}

        <div className="mt-6 grid gap-5">
          {visits?.map((v) => (
            <div key={v._id} className="space-y-2">
              <VisitCard
                showAuthor={false}
                visit={{ ...v, userName: display }}
              />
              <div className="flex items-center justify-end gap-3 px-1 text-sm">
                <Link
                  href={`/visits/${v._id}/edit`}
                  className="rounded-full border border-[var(--color-line)] px-4 py-1.5 hover:border-[var(--color-ink-soft)]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(v._id as Id<"visits">)}
                  disabled={pendingDelete === v._id}
                  className="rounded-full border border-[var(--color-clay)] px-4 py-1.5 text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10 disabled:opacity-50"
                >
                  {pendingDelete === v._id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
        {label}
      </dt>
      <dd className="font-display text-2xl tabular-nums">{value}</dd>
    </div>
  );
}
