export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRating(n: number): string {
  return n === 0 ? "—" : n.toFixed(1);
}

export const RATING_LABELS: Record<"environment" | "coffee" | "location", string> = {
  environment: "Environment",
  coffee: "Selection & coffee",
  location: "Location",
};
