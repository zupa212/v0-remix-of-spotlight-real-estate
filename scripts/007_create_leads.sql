-- Create leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  
  -- Contact info
  full_name text not null,
  email text not null,
  phone text,
  
  -- Lead details
  message text,
  lead_type text check (lead_type in ('property_inquiry', 'viewing_request', 'general_inquiry', 'contact_form')),
  lead_source text default 'website',
  
  -- Related entities
  property_id uuid references public.properties(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  
  -- Status and pipeline
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'viewing_scheduled', 'negotiating', 'closed_won', 'closed_lost')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  
  -- Preferences
  preferred_contact_method text,
  preferred_language text default 'en',
  budget_min decimal(12, 2),
  budget_max decimal(12, 2),
  preferred_regions text[],
  
  -- Tracking
  notes text,
  last_contacted_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.leads enable row level security;

-- Only authenticated users can view and manage leads
create policy "leads_select_auth"
  on public.leads for select
  using (auth.uid() is not null);

create policy "leads_insert_all"
  on public.leads for insert
  with check (true); -- Allow public to create leads (contact forms)

create policy "leads_update_auth"
  on public.leads for update
  using (auth.uid() is not null);

create policy "leads_delete_auth"
  on public.leads for delete
  using (auth.uid() is not null);

create index if not exists idx_leads_property on public.leads(property_id);
create index if not exists idx_leads_agent on public.leads(agent_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_assigned on public.leads(assigned_to);
