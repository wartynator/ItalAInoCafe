"use client";

import { VisitForm } from "@/components/VisitForm";

export default function NewVisitPage() {
  return (
    <div className="mx-auto max-w-[640px] space-y-8">
      <header className="flourish">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-clay)]">
          Nuovo caffè
        </p>
        <h1 className="font-display-italic text-5xl leading-[1.05] md:text-6xl">
          Log a visit
        </h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          Three ratings, a few words, optionally a photo or two.
        </p>
      </header>
      <VisitForm
        mode="create"
        initial={{
          ratings: { environment: 4, coffee: 4, location: 4 },
          notes: "",
          tags: [],
          photos: [],
          visitedAt: Date.now(),
        }}
      />
    </div>
  );
}
