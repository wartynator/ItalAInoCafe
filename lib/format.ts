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

// "Friedrichstraße 12, Mitte, Berlin, 10117, Deutschland" -> "Berlin"
export function cityFromAddress(s: string): string {
  if (!s) return "";
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  // drop the street (parts[0]); drop pure-numeric parts (postcodes); drop the last (usually country)
  const middle = parts
    .slice(1, parts.length > 2 ? -1 : undefined)
    .filter((p) => !/^\d+$/.test(p));
  return middle[middle.length - 1] || parts[parts.length - 1] || "";
}

// "Friedrichstraße 12, Mitte, Berlin, 10117, Deutschland" -> "Friedrichstraße 12 · Berlin"
export function shortAddress(s: string): string {
  if (!s) return "";
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return s;
  const street = parts[0];
  const cityCandidate = parts
    .slice(1)
    .map((p) => p.replace(/\b\d{4,6}\b/g, "").trim())
    .find((p) => p && p !== street && !/^\d+$/.test(p));
  if (!cityCandidate) return street;
  return `${street} · ${cityCandidate}`;
}
