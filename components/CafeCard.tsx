import Link from "next/link";
import { RatingDots } from "./Rating";
import { TagChip } from "./TagChip";
import { formatRating } from "@/lib/format";

type CafeSummary = {
  _id: string;
  name: string;
  address: string;
  visitCount: number;
  averages: { environment: number; coffee: number; location: number; overall: number };
  topTags: string[];
};

export function CafeCard({ cafe }: { cafe: CafeSummary }) {
  return (
    <Link
      href={`/cafes/${cafe._id}`}
      className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-ink-soft)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight tracking-tight truncate">
            {cafe.name}
          </h3>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1 truncate">{cafe.address}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex justify-end">
            <RatingDots value={cafe.averages.overall} />
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] mt-1 tabular-nums">
            {formatRating(cafe.averages.overall)} · {cafe.visitCount}{" "}
            {cafe.visitCount === 1 ? "visit" : "visits"}
          </p>
        </div>
      </div>
      {cafe.topTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cafe.topTags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}
    </Link>
  );
}
