"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingPicker } from "@/components/Rating";
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
  ratings: { environment: number; coffee: number; location: number };
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
  const [environment, setEnvironment] = useState(initial.ratings.environment);
  const [coffee, setCoffee] = useState(initial.ratings.coffee);
  const [location, setLocation] = useState(initial.ratings.location);
  const [notes, setNotes] = useState(initial.notes);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [photos, setPhotos] = useState<Photo[]>(initial.photos);
  const [visitedAt, setVisitedAt] = useState(() =>
    new Date(initial.visitedAt).toISOString().slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit && initial.visitId) {
        await updateVisit({
          id: initial.visitId,
          ratings: { environment, coffee, location },
          notes: notes.trim(),
          tags,
          photoIds: photos.map((p) => p.storageId),
          visitedAt: new Date(visitedAt).getTime(),
        });
        router.push(`/cafes/${initial.cafeId}`);
        return;
      }

      if (!name.trim()) {
        setSubmitting(false);
        return setError("Café name is required.");
      }
      if (!address.trim() || !coords) {
        setSubmitting(false);
        return setError(
          "Pick an address from the suggestions so we can place it on the map.",
        );
      }
      const cafeId = await getOrCreate({
        name: name.trim(),
        address: address.trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
      await createVisit({
        cafeId,
        ratings: { environment, coffee, location },
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
    <form onSubmit={onSubmit} className="space-y-8">
      {!isEdit && (
        <section className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Café name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bonanza Coffee Heroes"
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Address
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
                }}
                placeholder="Start typing an address…"
              />
            </div>
            {coords && (
              <p className="mt-1 text-xs text-[var(--color-ink-soft)] tabular-nums">
                Pinned at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
          </label>
        </section>
      )}

      {isEdit && initial.cafeName && (
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
            Editing visit at
          </p>
          <p className="font-display text-xl tracking-tight">{initial.cafeName}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {initial.cafeAddress}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-xl tracking-tight">How was it?</h2>
        <div className="mt-4 space-y-4">
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
      </section>

      <label className="block">
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Single-origin Ethiopia, slow pour, dog-friendly patio…"
          className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
        />
      </label>

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
            className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)]"
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
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          Photos
        </span>
        <div className="mt-1">
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </div>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
          Visited
        </span>
        <input
          type="date"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="mt-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
        />
      </label>

      {error && (
        <p className="rounded-xl border border-[var(--color-clay)] bg-[var(--color-clay)]/10 px-4 py-3 text-sm text-[var(--color-ink)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-bg)] disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Save visit"}
        </button>
      </div>
    </form>
  );
}
