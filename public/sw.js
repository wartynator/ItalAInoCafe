// ItalAIno · Caffè service worker — minimal offline shell.
const CACHE = "italaino-v1";
const PRECACHE = ["/", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // never touch cross-origin (Convex websocket, OSM tiles, Google fonts, etc.)
  if (url.origin !== self.location.origin) return;
  // skip Next internals like HMR / data RSC payloads when offline
  if (url.pathname.startsWith("/_next/data") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        // cache successful navigations + static assets opportunistically
        if (fresh.ok && (req.mode === "navigate" || url.pathname.startsWith("/_next/static"))) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone()).catch(() => undefined);
        }
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const home = await caches.match("/");
          if (home) return home;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })(),
  );
});
