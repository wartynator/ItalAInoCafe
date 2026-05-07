"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/Avatar";
import { displayName } from "@/lib/format";

export default function PeoplePage() {
  const [q, setQ] = useState("");
  const results = useQuery(api.profiles.search, { q, limit: 12 });
  const toggle = useMutation(api.follows.toggle);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">People</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Find friends and follow them to see their visits in your feed.
        </p>
      </header>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-base focus:outline-none focus:border-[var(--color-ink)]"
      />

      {q.trim().length < 2 && (
        <p className="text-sm text-[var(--color-ink-soft)]">
          Type at least two characters to search.
        </p>
      )}

      {q.trim().length >= 2 && results && results.length === 0 && (
        <p className="text-sm text-[var(--color-ink-soft)]">No one found.</p>
      )}

      <ul className="grid gap-3">
        {results?.map((u) => {
          const name = displayName(u.name, u.email);
          return (
            <li
              key={u._id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-3 md:p-4"
            >
              <Link
                href={`/u/${u._id}`}
                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
              >
                <Avatar url={u.avatarUrl} name={name} email={u.email} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  {u.email && (
                    <p className="truncate text-xs text-[var(--color-ink-soft)]">
                      {u.email}
                    </p>
                  )}
                </div>
              </Link>
              <FollowButton userId={u._id} />
            </li>
          );
        })}
      </ul>
    </div>
  );

  function FollowButton({ userId }: { userId: Id<"users"> }) {
    const isFollowing = useQuery(api.follows.isFollowing, { userId });
    const [busy, setBusy] = useState(false);
    async function onClick() {
      setBusy(true);
      try {
        await toggle({ userId });
      } finally {
        setBusy(false);
      }
    }
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy || isFollowing === undefined}
        className={
          "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors " +
          (isFollowing
            ? "border border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
            : "btn-primary")
        }
      >
        {isFollowing === undefined ? "…" : isFollowing ? "Following" : "Follow"}
      </button>
    );
  }
}
