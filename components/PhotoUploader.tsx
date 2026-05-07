"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Uploaded = {
  storageId: Id<"_storage">;
  previewUrl: string;
};

export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: Uploaded[];
  onChange: (next: Uploaded[]) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    try {
      const next: Uploaded[] = [...photos];
      for (const file of Array.from(files)) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        next.push({ storageId, previewUrl: URL.createObjectURL(file) });
      }
      onChange(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="flex h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-ink-soft)]">
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? "Uploading…" : "Tap or drop photos here"}
      </label>
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.storageId} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt=""
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-[var(--color-bg)]/90 px-2 py-0.5 text-xs"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
