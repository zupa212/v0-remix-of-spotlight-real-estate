-- Create property images table
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  caption_en text,
  caption_gr text,
  display_order int default 0,
  is_main boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.property_images enable row level security;

-- Anyone can view images of published properties
create policy "property_images_select_all"
  on public.property_images for select
  using (
    exists (
      select 1 from public.properties
      where id = property_id and (published = true or auth.uid() is not null)
    )
  );

-- Only authenticated users can manage images
create policy "property_images_insert_auth"
  on public.property_images for insert
  with check (auth.uid() is not null);

create policy "property_images_update_auth"
  on public.property_images for update
  using (auth.uid() is not null);

create policy "property_images_delete_auth"
  on public.property_images for delete
  using (auth.uid() is not null);

create index if not exists idx_property_images_property on public.property_images(property_id);
