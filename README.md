# Sabai Flashcards

A warm, simple flashcard web app that helps Burmese speakers learn English
**words, phrases, and idioms**. Tap a card to flip between English and Burmese;
switch the practice direction (EN → MY or MY → EN); no login required for
learners. An admin area manages the vocabulary.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — warm cream/terracotta theme
- **Framer Motion** — 3D card flip
- **Supabase (Postgres)** — database, auth, and row-level security
- **Noto Sans Myanmar** — proper Burmese rendering

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app runs immediately on **sample data**
(`lib/sample-data.ts`) so you can try it before setting up a database.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard: **SQL → New query**, paste `supabase/schema.sql`, run it.
   This creates the `cards` table, an updated-at trigger, and RLS policies
   (public read, authenticated write) — plus a few seed rows.
3. Copy `.env.local.example` to `.env.local` and fill in the URL + anon key
   from **Project Settings → API**.
4. Create an admin login: **Authentication → Users → Add user** (email +
   password). Any authenticated user can manage cards in Phase 1.
5. Restart `npm run dev`. The app now reads live data, and `/admin` works.

## Project structure

```
app/
  page.tsx            Public practice deck
  admin/page.tsx      Auth-gated card management
lib/
  types.ts            Card / CardType / Direction
  cards.ts            Data access (Supabase → sample fallback)
  sample-data.ts      Offline demo deck
  supabase/           Browser + server clients, env detection
components/
  Flashcard.tsx       Flip animation + card faces
  PracticeDeck.tsx    Mode picker, direction toggle, navigation
  admin/              LoginForm, CardManager (CRUD)
supabase/schema.sql   Database schema + RLS policies
proxy.ts              Refreshes the Supabase auth session
```

## Ideas for later phases

- Audio pronunciation (Supabase Storage)
- Spaced repetition (SRS) with per-user progress → optional user accounts
- Bulk CSV import in the admin
- "Known / still learning" tracking via local storage
- PWA / offline mode
