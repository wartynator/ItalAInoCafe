"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { VisitForm } from "@/components/VisitForm";
import Link from "next/link";

export default function EditVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const visit = useQuery(api.visits.byId, { id: id as Id<"visits"> });

  if (visit === undefined) {
    return (
      <div className="mx-auto max-w-[640px]">
        <div className="h-72 animate-pulse rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)]" />
      </div>
    );
  }

  if (visit === null) {
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-8 text-center">
        <h1 className="font-display text-2xl tracking-tight">
          Visit not found
        </h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          It may have been deleted, or it isn&apos;t yours to edit.
        </p>
        <Link
          href="/me"
          className="btn-primary mt-5 inline-flex items-center rounded-full px-5 py-2.5 text-sm"
        >
          Back to your visits
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] space-y-8">
      <header>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          Edit visit
        </h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          Tweak the ratings, notes, tags or photos.
        </p>
      </header>
      <VisitForm
        mode="edit"
        initial={{
          visitId: visit._id,
          cafeId: visit.cafeId,
          cafeName: visit.cafeName,
          cafeAddress: visit.cafeAddress,
          overall: visit.overall || 0,
          ratings: visit.ratings ?? null,
          notes: visit.notes,
          tags: visit.tags,
          photos: visit.photos.map((p) => ({
            storageId: p.storageId,
            previewUrl: p.url,
          })),
          visitedAt: visit.visitedAt,
        }}
      />
    </div>
  );
}
