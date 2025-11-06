-- Create viewings table
create table if not exists public.viewings (
  id uuid primary key default gen_random_uuid(),
  
  property_id uuid not null references public.properties(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  
  -- Viewing details
  scheduled_date timestamptz not null,
  duration_minutes int default 60,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Contact info (if not linked to lead)
  client_name text,
  client_email text,
  client_phone text,
  
  -- Notes
  notes text,
  feedback text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Enable RLS
alter table public.viewings enable row level security;

-- Only authenticated users can manage viewings
create policy "viewings_select_auth"
  on public.viewings for select
  using (auth.uid() is not null);

create policy "viewings_insert_auth"
  on public.viewings for insert
  with check (auth.uid() is not null);

create policy "viewings_update_auth"
  on public.viewings for update
  using (auth.uid() is not null);

create policy "viewings_delete_auth"
  on public.viewings for delete
  using (auth.uid() is not null);

create index if not exists idx_viewings_property on public.viewings(property_id);
create index if not exists idx_viewings_lead on public.viewings(lead_id);
create index if not exists idx_viewings_agent on public.viewings(agent_id);
create index if not exists idx_viewings_date on public.viewings(scheduled_date);
