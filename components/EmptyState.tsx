import Link from "next/link";

export function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-12 text-center">
      <div
        aria-hidden
        className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full font-display-italic text-3xl text-[var(--color-clay)]"
        style={{ background: "var(--color-clay-soft)" }}
      >
        ☕
      </div>
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[var(--color-ink-soft)]">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-bg)]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
