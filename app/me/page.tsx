"use client";

import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/Avatar";
import { VisitCard } from "@/components/VisitCard";
import { EmptyState } from "@/components/EmptyState";
import { formatRating, displayName } from "@/lib/format";

export default function MePage() {
  const me = useQuery(api.users.me);
  const visits = useQuery(api.visits.myFeed);
  const counts = useQuery(
    api.follows.counts,
    me ? { userId: me._id } : "skip",
  );

  const stats = (() => {
    if (!visits || visits.length === 0) return null;
    const overalls = visits.map((v) => v.overall || 0).filter((n) => n > 0);
    const avg = overalls.length
      ? overalls.reduce((a, b) => a + b, 0) / overalls.length
      : 0;
    const cafes = new Set(visits.map((v) => v.cafeId));
    return { count: visits.length, avg, cafes: cafes.size };
  })();

  const display = displayName(me?.name, me?.email);

  return (
    <div className="space-y-8">
      <ProfileEditor me={me ?? null} />

      {stats && (
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-5 sm:grid-cols-4">
          <Stat label="Visits" value={stats.count.toString()} />
          <Stat label="Cafés" value={stats.cafes.toString()} />
          <Stat label="Avg rating" value={formatRating(stats.avg)} />
          <Stat
            label="Followers"
            value={(counts?.followers ?? 0).toString()}
            sub={`${counts?.following ?? 0} following`}
          />
        </dl>
      )}

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
                className="h-44 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]"
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
              ctaLabel="New coffee"
            />
          </div>
        )}

        <div className="mt-6 grid gap-5">
          {visits?.map((v) => (
            <VisitCard
              key={v._id}
              showAuthor={false}
              canEdit
              visit={{ ...v, userName: display }}
            />
          ))}
        </div>
      </section>

      <AccountActions />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
        {label}
      </dt>
      <dd className="font-display text-2xl tabular-nums">{value}</dd>
      {sub && <p className="text-xs text-[var(--color-ink-soft)]">{sub}</p>}
    </div>
  );
}

function ProfileEditor({
  me,
}: {
  me: {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
}) {
  const update = useMutation(api.profiles.update);
  const setAvatar = useMutation(api.profiles.setAvatar);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(me?.name ?? "");
  const [bio, setBio] = useState(me?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(me?.name ?? "");
    setBio(me?.bio ?? "");
  }, [me?.name, me?.bio]);

  if (!me) {
    return (
      <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]" />
    );
  }

  const display = displayName(me.name, me.email);

  async function onSave() {
    setSaving(true);
    try {
      await update({ name: name.trim(), bio: bio.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function onAvatar(file: File) {
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
      await setAvatar({ storageId });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar
            url={me.avatarUrl}
            name={display}
            email={me.email}
            size={72}
            className="text-3xl"
          />
          <label
            className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] text-xs"
            title="Change avatar"
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
            />
            {uploading ? "…" : "✎"}
          </label>
        </div>
        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">
                {display}
              </h1>
              {me.email && (
                <p className="text-sm text-[var(--color-ink-soft)]">{me.email}</p>
              )}
              {me.bio && (
                <p className="mt-2 max-w-prose whitespace-pre-line text-sm">
                  {me.bio}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
                  Display name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  placeholder={display}
                  className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
                  Bio
                </span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="A line about your coffee taste."
                  className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
                />
                <span className="mt-1 block text-right text-[11px] text-[var(--color-ink-soft)]">
                  {280 - bio.length} chars left
                </span>
              </label>
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2 self-start">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-sm hover:border-[var(--color-ink-soft)]"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="btn-primary rounded-full px-4 py-1.5 text-sm"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-sm hover:border-[var(--color-ink-soft)]"
            >
              Edit profile
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function AccountActions() {
  const { signOut } = useAuthActions();
  return (
    <div className="border-t border-[var(--color-line)] pt-6 text-sm">
      <button
        onClick={() => void signOut()}
        className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        Sign out
      </button>
    </div>
  );
}
