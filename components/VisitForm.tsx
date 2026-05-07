"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { OverallRating, RatingPicker } from "@/components/Rating";
import { TagChip } from "@/components/TagChip";
import { PhotoUploader } from "@/components/PhotoUploader";
import { AddressAutocomplete, GeocodeResult } from "@/components/AddressAutocomplete";
import { RATING_LABELS } from "@/lib/format";

export type Photo = { storageId: Id<"_storage">; previewUrl: string };

export type VisitFormInitial = {
  visitId?: Id<"visits">;
  cafeId?: Id<"cafes">;
  cafeName?: string;
  cafeAddress?: string;
  overall: number;
  ratings: { environment: number; coffee: number; location: number } | null;
  notes: string;
  tags: string[];
  photos: Photo[];
  visitedAt: number;
};

export function VisitForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial: VisitFormInitial;
}) {
  const router = useRouter();
  const getOrCreate = useMutation(api.cafes.getOrCreate);
  const createVisit = useMutation(api.visits.create);
  const updateVisit = useMutation(api.visits.update);

  const [name, setName] = useState(initial.cafeName ?? "");
  const [address, setAddress] = useState(initial.cafeAddress ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [overall, setOverall] = useState(initial.overall || 0);
  const [useDetailed, setUseDetailed] = useState(!!initial.ratings);
  const [environment, setEnvironment] = useState(
    initial.ratings?.environment ?? initial.overall ?? 4,
  );
  const [coffee, setCoffee] = useState(
    initial.ratings?.coffee ?? initial.overall ?? 4,
  );
  const [location, setLocation] = useState(
    initial.ratings?.location ?? initial.overall ?? 4,
  );

  const [notes, setNotes] = useState(initial.notes);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [photos, setPhotos] = useState<Photo[]>(initial.photos);
  const [visitedAt, setVisitedAt] = useState(() =>
    new Date(initial.visitedAt).toISOString().slice(0, 10),
  );
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const canSubmit = !!overall && (isEdit || (name.trim() && coords));

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!overall) {
      setError("Pick a rating first.");
      return;
    }
    setSubmitting(true);
    const ratingsArg = useDetailed ? { environment, coffee, location } : undefined;
    try {
      if (isEdit && initial.visitId) {
        await updateVisit({
          id: initial.visitId,
          overall,
          ratings: ratingsArg,
          notes: notes.trim(),
          tags,
          photoIds: photos.map((p) => p.storageId),
          visitedAt: new Date(visitedAt).getTime(),
        });
        router.push(initial.cafeId ? `/cafes/${initial.cafeId}` : "/me");
        return;
      }

      if (!name.trim()) {
        setSubmitting(false);
        return setError("Café name is required.");
      }
      if (!address.trim() || !coords) {
        setSubmitting(false);
        return setError("Pick a place from the search suggestions.");
      }
      const cafeId = await getOrCreate({
        name: name.trim(),
        address: address.trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
      await createVisit({
        cafeId,
        overall,
        ratings: ratingsArg,
        notes: notes.trim(),
        tags,
        photoIds: photos.map((p) => p.storageId),
        visitedAt: new Date(visitedAt).getTime(),
      });
      router.push(`/cafes/${cafeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24 md:pb-0">
      {!isEdit && (
        <section className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Where were you?
            </span>
            <div className="mt-1">
              <AddressAutocomplete
                value={address}
                onChange={(s) => {
                  setAddress(s);
                  setCoords(null);
                }}
                onSelect={(r: GeocodeResult) => {
                  setAddress(r.displayName);
                  setCoords({ lat: r.lat, lng: r.lng });
                  if (!name.trim()) {
                    const head = r.displayName.split(",")[0]?.trim();
                    if (head) setName(head);
                  }
                }}
                placeholder="Search by café name or address…"
              />
            </div>
          </label>
          {address && (
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
                Café name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bonanza Coffee"
                className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-base focus:outline-none focus:border-[var(--color-ink)]"
              />
            </label>
          )}
        </section>
      )}

      {isEdit && initial.cafeName && (
        <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
            Editing visit at
          </p>
          <p className="font-display text-xl tracking-tight">{initial.cafeName}</p>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-6 py-7">
        <h2 className="text-center font-display text-2xl tracking-tight">
          How was it?
        </h2>
        <div className="mt-4">
          <OverallRating value={overall} onChange={setOverall} />
        </div>
      </section>

      <label className="block">
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          A quick note
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What did you order? What was the vibe?"
          className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-base focus:outline-none focus:border-[var(--color-ink)]"
        />
      </label>

      <div>
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          Photos
        </span>
        <div className="mt-1">
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((s) => !s)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-ink-soft)]"
      >
        <span>Tags, detailed ratings & date</span>
        <span className="font-mono text-base">{showMore ? "−" : "+"}</span>
      </button>

      {showMore && (
        <div className="space-y-6 rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]/60 p-5">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Tags
            </span>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="wifi, oat milk, pastry…"
                className="flex-1 rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm hover:border-[var(--color-ink-soft)]"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <TagChip
                    key={t}
                    onRemove={() => setTags(tags.filter((x) => x !== t))}
                  >
                    {t}
                  </TagChip>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--color-ink-soft)]">
                Rate environment, coffee & location separately
              </span>
              <input
                type="checkbox"
                checked={useDetailed}
                onChange={(e) => setUseDetailed(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-ink)]"
              />
            </label>
            {useDetailed && (
              <div className="mt-3 space-y-3">
                <RatingPicker
                  label={RATING_LABELS.environment}
                  value={environment}
                  onChange={setEnvironment}
                />
                <RatingPicker
                  label={RATING_LABELS.coffee}
                  value={coffee}
                  onChange={setCoffee}
                />
                <RatingPicker
                  label={RATING_LABELS.location}
                  value={location}
                  onChange={setLocation}
                />
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Visited
            </span>
            <input
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              className="mt-1 rounded-xl border border-[var(--color-line)] bg-[color:var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
          </label>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-[var(--color-clay)] bg-[var(--color-clay)]/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {/* Sticky save bar on mobile, inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-bg)]/95 px-5 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:px-0 md:py-0">
        <div className="mx-auto flex max-w-[640px] items-center justify-between gap-3 md:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="btn-primary inline-flex items-center rounded-full px-6 py-3 text-sm md:px-5 md:py-2.5"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
