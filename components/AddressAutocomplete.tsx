"use client";

import { useEffect, useRef, useState } from "react";

export type GeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
};

type NominatimItem = {
  display_name: string;
  lat: string;
  lon: string;
};

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Address",
}: {
  value: string;
  onChange: (s: string) => void;
  onSelect: (r: GeocodeResult) => void;
  placeholder?: string;
}) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`,
          { headers: { Accept: "application/json" } },
        );
        const data: NominatimItem[] = await res.json();
        setResults(
          data.map((d) => ({
            displayName: d.display_name,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          })),
        );
      } catch {
        setResults([]);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm placeholder:text-[var(--color-ink-soft)] focus:outline-none focus:border-[var(--color-ink)]"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(r);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
              >
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
