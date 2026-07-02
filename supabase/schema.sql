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
