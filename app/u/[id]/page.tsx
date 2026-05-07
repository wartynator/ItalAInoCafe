"use client";

import { use, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/Avatar";
import { VisitCard } from "@/components/VisitCard";
import { displayName } from "@/lib/format";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;
  const profile = useQuery(api.profiles.getById, { id: userId });
  const me = useQuery(api.users.me);
  const visits = useQuery(api.visits.byUser, { userId, limit: 50 });
  const counts = useQuery(api.follows.counts, { userId });
  const isFollowing = useQuery(api.follows.isFollowing, { userId });
  const toggleFollow = useMutation(api.follows.toggle);
  const [busy, setBusy] = useState(false);

  if (profile === undefined) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]" />
    );
  }
  if (profile === null) {
    return <p className="text-[var(--color-ink-soft)]">Profile not found.</p>;
  }

  const name = displayName(profile.name, profile.email);
  const isMe = me?._id === profile._id;

  async function onToggle() {
    setBusy(true);
    try {
      await toggleFollow({ userId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            url={profile.avatarUrl}
            name={name}
            email={profile.email}
            size={72}
            className="text-3xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              {name}
            </h1>
            {profile.bio && (
              <p className="mt-2 max-w-prose text-sm text-[var(--color-ink)] whitespace-pre-line">
                {profile.bio}
              </p>
            )}
            <p className="mt-2 text-xs text-[var(--color-ink-soft)] tabular-nums">
              {counts?.followers ?? 0} followers · {counts?.following ?? 0} following
            </p>
          </div>
          {!isMe && (
            <button
              type="button"
              onClick={onToggle}
              disabled={busy || isFollowing === undefined}
              className={
                "self-start shrink-0 rounded-full px-5 py-2 text-sm transition-colors " +
                (isFollowing
                  ? "border border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
                  : "btn-primary")
              }
            >
              {isFollowing === undefined ? "…" : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-tight">Visits</h2>
        {visits === undefined && (
          <div className="mt-4 grid gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]"
              />
            ))}
          </div>
        )}
        {visits && visits.length === 0 && (
          <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
            Nothing logged yet.
          </p>
        )}
        <div className="mt-4 grid gap-5">
          {visits?.map((v) => (
            <VisitCard
              key={v._id}
              visit={v}
              showAuthor={false}
              canEdit={isMe}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
