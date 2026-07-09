-- Sabai Flashcards — Phase 1 schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

-- 1. Card type enum ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'card_type') then
    create type card_type as enum ('word', 'phrase', 'idiom');
  end if;
end$$;

-- 2. Cards table ------------------------------------------------------------
create table if not exists public.cards (
  id            uuid primary key default gen_random_uuid(),
  type          card_type not null,
  english       text not null,
  burmese       text not null,
  example_en    text,
  example_my    text,
  pronunciation text,
  audio_url     text,
  category      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Safe to re-run: adds audio_url to tables created before this column existed.
alter table public.cards add column if not exists audio_url text;

create index if not exists cards_type_idx on public.cards (type);
create index if not exists cards_created_at_idx on public.cards (created_at desc);

-- Keep updated_at fresh on edits.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- 3. Row Level Security -----------------------------------------------------
-- Public (anonymous) users can READ. Only authenticated users (admins you
-- create in the Supabase Auth dashboard) can write.
alter table public.cards enable row level security;

drop policy if exists "cards are public to read" on public.cards;
create policy "cards are public to read"
  on public.cards for select
  using (true);

drop policy if exists "authenticated can insert" on public.cards;
create policy "authenticated can insert"
  on public.cards for insert
  to authenticated with check (true);

drop policy if exists "authenticated can update" on public.cards;
create policy "authenticated can update"
  on public.cards for update
  to authenticated using (true) with check (true);

drop policy if exists "authenticated can delete" on public.cards;
create policy "authenticated can delete"
  on public.cards for delete
  to authenticated using (true);

-- 4. Optional seed data -----------------------------------------------------
-- Only seeds when the table is empty, so re-running this file never creates
-- duplicate sample rows.
insert into public.cards (type, english, burmese, example_en, example_my, pronunciation, category)
select type::card_type, english, burmese, example_en, example_my, pronunciation, category
from (values
  ('word', 'generous', 'ရက်ရောသော', 'She is generous with her time.', 'သူမသည် သူမ၏အချိန်ကို ရက်ရောစွာ ပေးတတ်သည်။', '/ˈdʒɛn.ər.əs/', 'personality'),
  ('phrase', 'on the other hand', 'တစ်ဖက်တွင်မူ', 'It is cheap; on the other hand, the quality is poor.', 'ဒါက ဈေးပေါတယ်၊ တစ်ဖက်တွင်မူ အရည်အသွေးက ညံ့တယ်။', null, 'linking'),
  ('idiom', 'a piece of cake', 'အလွန်လွယ်ကူသော အရာ', 'The exam was a piece of cake.', 'စာမေးပွဲက အလွန်လွယ်ကူတယ်။', null, 'difficulty')
) as seed(type, english, burmese, example_en, example_my, pronunciation, category)
where not exists (select 1 from public.cards);

-- ===========================================================================
-- Announcements — editorial "what's new" posts, independent of cards.
-- Powers the homepage "Latest updates" widget so visitors see the site is
-- active. Text is written by hand in the admin area; it does not read cards.
-- ===========================================================================

create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  category     text,                                  -- e.g. new-cards | feature | fix
  published    boolean not null default false,
  published_on date not null default current_date,    -- editable display date
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists announcements_published_idx
  on public.announcements (published, published_on desc);

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- RLS: anyone reads *published* posts; only authenticated admins write.
alter table public.announcements enable row level security;

drop policy if exists "published announcements are public" on public.announcements;
create policy "published announcements are public"
  on public.announcements for select
  using (published = true);

drop policy if exists "authenticated read all announcements" on public.announcements;
create policy "authenticated read all announcements"
  on public.announcements for select
  to authenticated using (true);

drop policy if exists "authenticated write announcements" on public.announcements;
create policy "authenticated write announcements"
  on public.announcements for all
  to authenticated using (true) with check (true);

-- ===========================================================================
-- App settings — key/value store for global flags editable from admin.
-- Currently holds the master on/off switch for the announcements widget.
-- ===========================================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (key, value)
values ('announcements_widget_enabled', 'true'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "settings are public to read" on public.app_settings;
create policy "settings are public to read"
  on public.app_settings for select
  using (true);

drop policy if exists "authenticated write settings" on public.app_settings;
create policy "authenticated write settings"
  on public.app_settings for all
  to authenticated using (true) with check (true);
