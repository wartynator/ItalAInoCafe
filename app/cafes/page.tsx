"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CafeCard } from "@/components/CafeCard";
import { EmptyState } from "@/components/EmptyState";

const CafeMap = dynamic(() => import("@/components/CafeMap"), { ssr: false });

export default function CafesPage() {
  const cafes = useQuery(api.cafes.list);
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    if (!cafes) return [];
    const set = new Set<string>();
    for (const c of cafes) for (const t of c.topTags) set.add(t);
    return [...set].sort();
  }, [cafes]);

  const filtered = useMemo(() => {
    if (!cafes) return [];
    if (!tag) return cafes;
    return cafes.filter((c) => c.topTags.includes(tag));
  }, [cafes, tag]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">Cafés</h1>
          <p className="mt-2 text-[var(--color-ink-soft)]">
            Every place you and your friends have logged.
          </p>
        </div>
      </header>

      {cafes && cafes.length > 0 && (
        <CafeMap
          cafes={cafes.map((c) => ({
            _id: c._id,
            name: c.name,
            address: c.address,
            lat: c.lat,
            lng: c.lng,
            visitCount: c.visitCount,
          }))}
        />
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTag(null)}
            className={
              "rounded-full px-3 py-1 text-xs " +
              (tag === null
                ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                : "border border-[var(--color-line)] text-[var(--color-ink-soft)]")
            }
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (t === tag
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "border border-[var(--color-line)] text-[var(--color-ink-soft)]")
              }
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {cafes && cafes.length === 0 && (
        <EmptyState
          title="No cafés yet."
          body="Cafés appear here after the first visit is logged."
          ctaHref="/new"
          ctaLabel="Log a visit"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <CafeCard key={c._id} cafe={c} />
        ))}
      </div>
    </div>
  );
}
