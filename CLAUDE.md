# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

**EzEng** — a flashcard app for Burmese speakers learning English. A public
practice deck (`/`) of words, phrases, and idioms with Burmese meanings, IPA,
and audio; plus a Supabase-auth-gated admin area (`/admin`) to manage cards.

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test suite exists. `npx tsx scripts/backfill-pronunciation.ts` backfills
IPA/audio on existing cards via the dictionary API.

## Next.js: read the docs first

This is a modified Next.js (v16) — see `@AGENTS.md`. The convention you will
trip on: **middleware is renamed to `proxy`**. The root `proxy.ts` exports a
`proxy()` function + `config.matcher` (docs: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).
Don't create `middleware.ts`.

## Architecture

**Data source is conditional.** Everything keys off `isSupabaseConfigured`
(`lib/supabase/env.ts` — true when the two `NEXT_PUBLIC_SUPABASE_*` env vars
are set). When unset, the app serves bundled `lib/sample-data.ts` and the
admin area shows a "not configured" notice. `getCards()` (`lib/cards.ts`) is
the single read path and falls back to sample data on any Supabase error, so
the public deck always renders. Keep this fallback intact.

**Three Supabase clients, don't mix them:**
- `lib/supabase/server.ts` — Server Components (cookie-based, async).
- `lib/supabase/client.ts` — browser/`"use client"` (admin forms, auth).
- `proxy.ts` — refreshes the auth session on `/admin/*` requests only.

**Auth model** is enforced in the database, not the app: `supabase/schema.sql`
RLS gives anonymous users SELECT-only, authenticated users full write.
Admins are created manually in the Supabase Auth dashboard (no signup flow).
`/admin` is `force-dynamic` and gates on `supabase.auth.getUser()`.

**Card shape** lives in `lib/types.ts` (`Card` / `CardInput`, `CardType` =
word|phrase|idiom). This must stay in sync with `supabase/schema.sql`.
Pronunciation (IPA + audio) is word-only — the admin form drops it when the
type isn't `word`, and playback (`lib/pronunciation.ts`) falls back to browser
speech synthesis when no recorded clip exists.

**SEO metadata is centralized** in `lib/site.ts`; the layout, `sitemap.ts`,
`robots.ts`, `manifest.ts`, and `opengraph-image.tsx` all read from it. Set
`NEXT_PUBLIC_SITE_URL` in production or canonical URLs point at localhost.

**Styling** is Tailwind v4 (CSS-first, no JS config). The warm palette
(`ink`, `accent`, `sand`, `cream`, `card`, `muted`) and the `.font-my` Burmese
font class are defined as CSS custom properties in `app/globals.css`.
