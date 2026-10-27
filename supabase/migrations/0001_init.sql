-- ─────────────────────────────────────────────────────────────
-- Niyama Yoga — initial schema
-- Run in Supabase → SQL Editor (or `supabase db push`).
-- All writes happen server-side with the service-role key;
-- RLS only lets signed-in users READ their own data.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Customer profile + membership lifecycle --------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  full_name             text not null,
  email                 text not null unique,
  phone                 text not null,
  experience_level      text not null check (experience_level in ('beginner', 'intermediate', 'advanced')),
  selected_plan         text not null check (selected_plan in ('1m', '3m', '6m', '12m')),
  membership_status     text not null default 'trial'
                        check (membership_status in ('trial', 'trial_expired', 'pending_payment', 'active', 'declined')),
  trial_started_at      timestamptz not null default now(),
  trial_ends_at         timestamptz not null default (now() + interval '3 days'),
  follow_up_sent_at     timestamptz,
  membership_started_at timestamptz,
  membership_ends_at    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists profiles_status_trial_end_idx
  on public.profiles (membership_status, trial_ends_at);

-- Feedback from customers who decline after the trial --------------------
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles (id) on delete set null,
  full_name    text,
  email        text not null,
  plan         text,
  reasons      text[] not null default '{}',
  suggestions  text,
  created_at   timestamptz not null default now()
);

create index if not exists feedback_created_idx on public.feedback (created_at desc);

-- Live class schedule ----------------------------------------------------
create table if not exists public.live_classes (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  instructor       text not null default 'Chandra Pratap',
  level            text not null default 'all' check (level in ('all', 'beginner', 'intermediate', 'advanced')),
  starts_at        timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 10 and 240),
  room_name        text not null default 'niyama-main-studio',
  created_at       timestamptz not null default now()
);

create index if not exists live_classes_starts_idx on public.live_classes (starts_at);

-- updated_at trigger -----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Row Level Security -----------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.feedback     enable row level security;
alter table public.live_classes enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users read own feedback" on public.feedback;
create policy "Users read own feedback"
  on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members read class schedule" on public.live_classes;
create policy "Members read class schedule"
  on public.live_classes for select to authenticated
  using (true);
