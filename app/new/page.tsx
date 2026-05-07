"use client";

import { VisitForm } from "@/components/VisitForm";

export default function NewVisitPage() {
  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          New coffee
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Tell me where you were and how it was.
        </p>
      </header>
      <VisitForm
        mode="create"
        initial={{
          overall: 0,
          ratings: null,
          notes: "",
          tags: [],
          photos: [],
          visitedAt: Date.now(),
        }}
      />
    </div>
  );
}
