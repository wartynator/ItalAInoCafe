"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

type CafePin = {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitCount: number;
};

const inkPin = L.divIcon({
  className: "italaino-pin-wrap",
  html: '<div class="italaino-pin"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function CafeMap({ cafes }: { cafes: CafePin[] }) {
  useEffect(() => {
    // Avoid Leaflet missing-icon assertion in dev
    // (we use divIcon, so default icons aren't actually needed)
  }, []);

  const center: [number, number] =
    cafes.length > 0 ? [cafes[0].lat, cafes[0].lng] : [52.52, 13.405];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-line)]">
      <MapContainer
        center={center}
        zoom={cafes.length > 0 ? 12 : 4}
        scrollWheelZoom
        style={{ height: 480, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
        />
        {cafes.map((c) => (
          <Marker key={c._id} position={[c.lat, c.lng]} icon={inkPin}>
            <Popup>
              <div className="font-display text-base">{c.name}</div>
              <div className="text-xs text-[var(--color-ink-soft)] mb-2">{c.address}</div>
              <Link
                href={`/cafes/${c._id}`}
                className="text-xs underline underline-offset-2"
              >
                {c.visitCount} {c.visitCount === 1 ? "visit" : "visits"} →
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
