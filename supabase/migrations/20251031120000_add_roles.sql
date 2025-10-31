-- Enable UUID generation
create extension if not exists pgcrypto;

-- Roles table (seeded with 'user' and 'doctor')
create table if not exists public.roles (
  name text primary key
);

insert into public.roles (name)
values ('user'), ('doctor')
on conflict (name) do nothing;

-- User roles mapping (supports local user ids as text)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  local_user_id text not null,
  role text not null references public.roles(name) on delete restrict,
  created_at timestamptz not null default now()
);

-- RLS: enable and allow anon full access for prototype
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

do $$ begin
  create policy "anon_select_roles" on public.roles
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "anon_all_user_roles" on public.user_roles
    for all using (true) with check (true);
exception when duplicate_object then null; end $$;


