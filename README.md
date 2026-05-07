# ItalAIno Café

A small, quiet web app for logging café visits with three ratings — environment, selection / coffee, and location — plus notes, tags, photos, and a map.

Built for the owner and a circle of friends. Modern minimal Scandinavian café aesthetic.

## Stack

- Next.js 15 (App Router, TypeScript)
- Convex (database, file storage, auth, real-time queries)
- Tailwind CSS v4 (theme tokens in `app/globals.css`)
- React Leaflet + CartoDB Positron tiles
- Nominatim (OpenStreetMap) for address geocoding

## Run it locally

```bash
npm install
npx convex dev          # in one terminal — first run will create a deployment and write NEXT_PUBLIC_CONVEX_URL to .env.local
npm run dev             # in another
```

Open http://localhost:3000.

The first time `npx convex dev` runs it will:
1. Ask you to log in to Convex.
2. Create a new deployment.
3. Write `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.
4. Push the schema in `convex/schema.ts` and the functions in `convex/*.ts`.

After that, sign up at `/sign-in` and you can log a visit at `/new`.

## Project layout

```
app/                # Next.js App Router pages
  page.tsx          # Recent feed (everyone)
  cafes/            # All cafés + map, café detail
  new/              # New visit form
  me/               # Your visits
  sign-in/
components/         # UI primitives (Rating, Cards, Map, Uploader, …)
convex/             # Schema and server functions
  schema.ts
  auth.ts
  cafes.ts
  visits.ts
  files.ts
  users.ts
lib/format.ts       # tiny formatting helpers
```

## Theme

Tokens live as CSS variables in `app/globals.css` under `@theme`. Adjusting the palette or fonts there propagates everywhere via Tailwind v4's `--color-*` tokens.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#FAF7F2` | Page background |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-ink` | `#1F1B16` | Primary text / button bg |
| `--color-ink-soft` | `#5C544A` | Secondary text |
| `--color-sage` | `#A7B5A0` | Primary accent |
| `--color-clay` | `#C99B7A` | Secondary / warm accent |
| `--color-line` | `#E7E1D8` | Hairlines |
| `--color-star` | `#3F3A33` | Filled rating dot |

## Notes

- Photos use Convex file storage (`generateUploadUrl` → direct POST → `_storage` id stored on the visit).
- Café records are deduped by a normalized `name|address` key.
- Tags are normalized to lowercase and capped at 12 per visit.
- The map uses CartoDB Positron tiles so it stays minimal and on-theme.
