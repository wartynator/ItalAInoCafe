export function TagChip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove tag"
          className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          ×
        </button>
      )}
    </span>
  );
}
