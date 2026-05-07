import Link from "next/link";
import { RatingDots } from "./Rating";
import { TagChip } from "./TagChip";
import { formatDate, RATING_LABELS } from "@/lib/format";

type Visit = {
  _id: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  userName?: string;
  ratings: { environment: number; coffee: number; location: number };
  notes: string;
  tags: string[];
  photoUrls: string[];
  visitedAt: number;
};

export function VisitCard({ visit, showAuthor = true }: { visit: Visit; showAuthor?: boolean }) {
  const overall =
    (visit.ratings.environment + visit.ratings.coffee + visit.ratings.location) / 3;

  return (
    <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/cafes/${visit.cafeId}`}
            className="font-display text-2xl leading-tight tracking-tight hover:underline underline-offset-4"
          >
            {visit.cafeName}
          </Link>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1 truncate">
            {visit.cafeAddress}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex justify-end">
            <RatingDots value={overall} />
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] mt-1 tabular-nums">
            {formatDate(visit.visitedAt)}
            {showAuthor && visit.userName ? ` · ${visit.userName}` : ""}
          </p>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["environment", "coffee", "location"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              {RATING_LABELS[k]}
            </dt>
            <dd>
              <RatingDots value={visit.ratings[k]} />
            </dd>
          </div>
        ))}
      </dl>

      {visit.photoUrls.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visit.photoUrls.slice(0, 3).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      {visit.notes && (
        <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-ink)] whitespace-pre-line">
          {visit.notes}
        </p>
      )}

      {visit.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visit.tags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}
    </article>
  );
}
