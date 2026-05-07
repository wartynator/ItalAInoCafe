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

// "Friedrichstraße 12, Mitte, 10117 Berlin, Berlin, Deutschland" -> "Berlin"
export function cityFromAddress(s: string): string {
  if (!s) return "";
  const COUNTRIES = new Set([
    "germany", "deutschland", "italia", "italy", "france", "francia",
    "españa", "spain", "españa", "portugal", "uk", "united kingdom",
    "ireland", "netherlands", "nederland", "belgium", "belgië", "belgique",
    "austria", "österreich", "switzerland", "schweiz", "suisse", "polska",
    "poland", "czechia", "česko", "czech republic", "slovakia", "slovensko",
    "hungary", "magyarország", "denmark", "danmark", "sweden", "sverige",
    "norway", "norge", "finland", "suomi", "usa", "united states",
    "canada", "australia", "japan", "日本",
  ]);
  const cleaned = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    // strip any postcode-looking number from each part
    .map((p) => p.replace(/\b\d{3,6}\b/g, "").replace(/\s+/g, " ").trim())
    // drop empty / purely numeric / country
    .filter(
      (p) => p && !/^\d+$/.test(p) && !COUNTRIES.has(p.toLowerCase()),
    );
  if (cleaned.length === 0) return "";
  // The city is usually one of the last entries before the country.
  return cleaned[cleaned.length - 1];
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
