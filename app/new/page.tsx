"use client";

import { VisitForm } from "@/components/VisitForm";

export default function NewVisitPage() {
  return (
    <div className="mx-auto max-w-[640px] space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          New coffee
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
