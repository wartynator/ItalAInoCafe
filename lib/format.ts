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

// (null, "matuss.moje@gmail.com") -> "Matuss Moje"
// ("Mathilde", "...") -> "Mathilde"
export function displayName(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) return name.trim();
  const local = (email ?? "").split("@")[0] ?? "";
  if (!local) return "You";
  return local
    .replace(/[._\-+]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// "Nico Caffé, 1181/3, ..., Košice, ..." -> "Nico Caffé · Košice"
export function placeAndCity(s: string): string {
  if (!s) return "";
  const place = s.split(",")[0]?.trim() ?? "";
  const city = cityFromAddress(s);
  if (!city) return place;
  if (!place || place.toLowerCase() === city.toLowerCase()) return city;
  return `${place} · ${city}`;
}

// "Nico Caffé, 1181/3, ..., Košice, District of Košice I, Region of Košice, ..., Slovakia" -> "Košice"
export function cityFromAddress(s: string): string {
  if (!s) return "";
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";

  // 1) If any part is "District of X" / "Region of X" / "Provincia di X" / "Bezirk X" /
  //    "Okres X" / "Kraj X" — the X is almost always the city.
  const REGION_RE =
    /^(?:District|Region|Province|County|Provincia|Comune|Bezirk|Okres|Kraj|Oblast|Powiat|Województwo)\s+(?:of\s+|di\s+|von\s+|du\s+|de\s+)?(.+?)(?:\s+[IVX]+)?$/i;
  for (const p of parts) {
    const m = p.match(REGION_RE);
    if (m && m[1] && m[1].length < 40) return m[1].trim();
  }

  // 2) Fallback — drop country, postcode-only parts, and region/admin segments,
  //    then return the last meaningful chunk.
  const COUNTRIES = new Set([
    "germany", "deutschland", "italia", "italy", "france", "francia",
    "spain", "españa", "portugal", "uk", "united kingdom", "ireland",
    "netherlands", "nederland", "belgium", "belgië", "belgique",
    "austria", "österreich", "switzerland", "schweiz", "suisse",
    "poland", "polska", "czechia", "česko", "czech republic",
    "slovakia", "slovensko", "hungary", "magyarország", "denmark",
    "danmark", "sweden", "sverige", "norway", "norge", "finland",
    "suomi", "usa", "united states", "canada", "australia", "japan",
  ]);
  const ADMIN_RE =
    /\b(district|region|province|county|state|kraj|oblast|powiat|provincia|bezirk|comune|slovensko)\b/i;

  const cleaned = parts
    .map((p) => p.replace(/\b\d{3,6}\b/g, "").replace(/\s+/g, " ").trim())
    .filter((p) => p && !/^\d+$/.test(p))
    .filter((p) => !COUNTRIES.has(p.toLowerCase()))
    .filter((p) => !ADMIN_RE.test(p));

  return cleaned[cleaned.length - 1] || "";
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
