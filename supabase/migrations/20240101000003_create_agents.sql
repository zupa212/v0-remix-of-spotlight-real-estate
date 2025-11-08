-- Create agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_gr text not null,
  email text not null,
  phone text,
  bio_en text,
  bio_gr text,
  avatar_url text,
  languages text[] default array['en', 'gr'],
  specialties text[],
  featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.agents enable row level security;

-- Anyone can view agents
create policy "agents_select_all"
  on public.agents for select
  using (true);

-- Only authenticated users can manage agents
create policy "agents_insert_auth"
  on public.agents for insert
  with check (auth.uid() is not null);

create policy "agents_update_auth"
  on public.agents for update
  using (auth.uid() is not null);

create policy "agents_delete_auth"
  on public.agents for delete
  using (auth.uid() is not null);
