-- Create properties table with all required fields
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text unique not null,
  
  -- Basic info
  title_en text not null,
  title_gr text not null,
  description_en text,
  description_gr text,
  
  -- Type and status
  property_type text not null check (property_type in ('apartment', 'house', 'villa', 'land', 'commercial', 'office')),
  listing_type text not null check (listing_type in ('sale', 'rent', 'both')),
  status text default 'available' check (status in ('available', 'pending', 'sold', 'rented', 'off-market')),
  
  -- Location
  region_id uuid references public.regions(id) on delete set null,
  address_en text,
  address_gr text,
  city_en text,
  city_gr text,
  postal_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Pricing
  price_sale decimal(12, 2),
  price_rent decimal(12, 2),
  currency text default 'EUR',
  
  -- Details
  bedrooms int,
  bathrooms int,
  area_sqm decimal(10, 2),
  plot_size_sqm decimal(10, 2),
  floor_number int,
  total_floors int,
  year_built int,
  energy_rating text,
  
  -- Features (stored as JSON arrays)
  features text[],
  amenities text[],
  
  -- Media
  main_image_url text,
  tour_3d_url text,
  video_url text,
  
  -- SEO
  meta_title_en text,
  meta_title_gr text,
  meta_description_en text,
  meta_description_gr text,
  
  -- Management
  agent_id uuid references public.agents(id) on delete set null,
  featured boolean default false,
  views_count int default 0,
  leads_count int default 0,
  display_order int default 0,
  published boolean default true,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Enable RLS
alter table public.properties enable row level security;

-- Anyone can view published properties
create policy "properties_select_published"
  on public.properties for select
  using (published = true or auth.uid() is not null);

-- Only authenticated users can manage properties
create policy "properties_insert_auth"
  on public.properties for insert
  with check (auth.uid() is not null);

create policy "properties_update_auth"
  on public.properties for update
  using (auth.uid() is not null);

create policy "properties_delete_auth"
  on public.properties for delete
  using (auth.uid() is not null);

-- Create indexes for performance
create index if not exists idx_properties_region on public.properties(region_id);
create index if not exists idx_properties_agent on public.properties(agent_id);
create index if not exists idx_properties_type on public.properties(property_type);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_featured on public.properties(featured);
create index if not exists idx_properties_code on public.properties(property_code);

-- Function to auto-generate property codes
create or replace function generate_property_code()
returns trigger as $$
declare
  year_code text;
  sequence_num int;
  new_code text;
begin
  -- Get year code (last 2 digits)
  year_code := to_char(now(), 'YY');
  
  -- Get next sequence number for this year
  select coalesce(max(
    case 
      when property_code ~ '^SP[0-9]{2}-[0-9]{4}$' 
      then cast(substring(property_code from 6 for 4) as int)
      else 0
    end
  ), 0) + 1
  into sequence_num
  from public.properties
  where property_code like 'SP' || year_code || '-%';
  
  -- Generate new code: SP{YY}-{0001}
  new_code := 'SP' || year_code || '-' || lpad(sequence_num::text, 4, '0');
  
  new.property_code := new_code;
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-generate property code on insert
drop trigger if exists trigger_generate_property_code on public.properties;

create trigger trigger_generate_property_code
  before insert on public.properties
  for each row
  when (new.property_code is null or new.property_code = '')
  execute function generate_property_code();
