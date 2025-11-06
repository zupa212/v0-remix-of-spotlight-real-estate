-- Create regions table
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_gr text not null,
  slug text unique not null,
  description_en text,
  description_gr text,
  image_url text,
  featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (public read, admin write)
alter table public.regions enable row level security;

-- Anyone can view regions
create policy "regions_select_all"
  on public.regions for select
  using (true);

-- Only authenticated users can insert/update/delete
create policy "regions_insert_auth"
  on public.regions for insert
  with check (auth.uid() is not null);

create policy "regions_update_auth"
  on public.regions for update
  using (auth.uid() is not null);

create policy "regions_delete_auth"
  on public.regions for delete
  using (auth.uid() is not null);
