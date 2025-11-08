-- ============================================================================
-- SPOTLIGHT REAL ESTATE - COMPLETE DATABASE SCHEMA
-- Combined migrations file - Run this once in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 001: PROFILES TABLE
-- ============================================================================

-- Create profiles table for admin users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text default 'admin' check (role in ('admin', 'agent', 'manager')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- 002: REGIONS TABLE
-- ============================================================================

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

-- ============================================================================
-- 003: AGENTS TABLE
-- ============================================================================

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

-- ============================================================================
-- 004: PROPERTIES TABLE
-- ============================================================================

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

-- ============================================================================
-- 005: PROPERTY IMAGES TABLE
-- ============================================================================

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

-- ============================================================================
-- 006: PROPERTY DOCUMENTS TABLE
-- ============================================================================

-- Create property documents table (PDFs, brochures, etc.)
create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  document_url text not null,
  document_type text check (document_type in ('brochure', 'floorplan', 'certificate', 'other')),
  title_en text,
  title_gr text,
  file_size_kb int,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.property_documents enable row level security;

-- Anyone can view documents of published properties
create policy "property_documents_select_all"
  on public.property_documents for select
  using (
    exists (
      select 1 from public.properties
      where id = property_id and (published = true or auth.uid() is not null)
    )
  );

-- Only authenticated users can manage documents
create policy "property_documents_insert_auth"
  on public.property_documents for insert
  with check (auth.uid() is not null);

create policy "property_documents_update_auth"
  on public.property_documents for update
  using (auth.uid() is not null);

create policy "property_documents_delete_auth"
  on public.property_documents for delete
  using (auth.uid() is not null);

create index if not exists idx_property_documents_property on public.property_documents(property_id);

-- ============================================================================
-- 007: LEADS TABLE
-- ============================================================================

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

-- ============================================================================
-- 008: SAVED SEARCHES TABLE
-- ============================================================================

-- Create saved_searches table for property search alerts
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters_json JSONB NOT NULL DEFAULT '{}',
  channels TEXT[] DEFAULT ARRAY['email'],
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alerts_log table to track sent alerts
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_active ON saved_searches(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_log_saved_search_id ON alerts_log(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_property_id ON alerts_log(property_id);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_searches
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for alerts_log (admin only)
CREATE POLICY "Admins can view all alerts"
  ON alerts_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 009: VIEWINGS TABLE
-- ============================================================================

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

-- ============================================================================
-- 010: SYNDICATION TABLE
-- ============================================================================

-- Create syndication_mappings table for portal feeds
CREATE TABLE IF NOT EXISTS syndication_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal TEXT NOT NULL UNIQUE CHECK (portal IN ('spitogatos', 'xe', 'idealista')),
  mapping_json JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default mappings
INSERT INTO syndication_mappings (portal, mapping_json, is_active) VALUES
  ('spitogatos', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('xe', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('idealista', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false)
ON CONFLICT (portal) DO NOTHING;

-- Enable RLS
ALTER TABLE syndication_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only)
CREATE POLICY "Admins can manage syndication mappings"
  ON syndication_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 011: ANALYTICS TABLE
-- ============================================================================

-- Create analytics_clicks table for heatmaps (privacy-friendly, no PII)
CREATE TABLE IF NOT EXISTS analytics_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  element_id TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  viewport_width INTEGER NOT NULL,
  viewport_height INTEGER NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create experiments table for A/B testing
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  route TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create experiment_metrics table
CREATE TABLE IF NOT EXISTS experiment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'cta_click', 'form_submit')),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_route ON analytics_clicks(route);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_clicked_at ON analytics_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_experiments_is_active ON experiments(is_active);
CREATE INDEX IF NOT EXISTS idx_experiment_metrics_experiment_id ON experiment_metrics(experiment_id);

-- Enable RLS
ALTER TABLE analytics_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public can insert clicks, admin can view)
CREATE POLICY "Anyone can record clicks"
  ON analytics_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON analytics_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage experiments"
  ON experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can record experiment metrics"
  ON experiment_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view experiment metrics"
  ON experiment_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 012: REFERRALS TABLE
-- ============================================================================

-- Create referrals table for affiliate/partner tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('agent', 'partner')),
  owner_id UUID NOT NULL,
  commission_pct DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add referral tracking to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_owner ON referrals(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_referral_code ON leads(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage referrals"
  ON referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Agents can view their own referral codes"
  ON referrals FOR SELECT
  USING (
    owner_type = 'agent' AND owner_id = auth.uid()
  );

-- ============================================================================
-- 013: LEAD SCORING TABLE
-- ============================================================================

-- Add lead scoring fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';

-- Create lead_activity table for timeline
CREATE TABLE IF NOT EXISTS lead_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'email', 'whatsapp', 'telegram', 'call', 'viewing', 'status_change')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead_id ON lead_activity(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_created_at ON lead_activity(created_at DESC);

-- Enable RLS
ALTER TABLE lead_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage lead activity"
  ON lead_activity FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 014: TASKS TABLE
-- ============================================================================

-- Create task_templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('new', 'contacted', 'qualified', 'viewing', 'offer', 'won', 'lost')),
  title TEXT NOT NULL,
  description TEXT,
  relative_due_days INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Insert default task templates
INSERT INTO task_templates (stage, title, description, relative_due_days) VALUES
  ('new', 'Initial Contact', 'Reach out to the lead within 24 hours', 1),
  ('contacted', 'Send Property Details', 'Send detailed information about requested properties', 1),
  ('qualified', 'Schedule Viewing', 'Arrange property viewing appointment', 2),
  ('viewing', 'Follow Up After Viewing', 'Contact lead for feedback after viewing', 1),
  ('offer', 'Prepare Offer Documents', 'Draft offer letter and required documents', 2),
  ('offer', 'Request Financial Pre-approval', 'Ensure buyer has financing in place', 3)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

-- Enable RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage task templates"
  ON task_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 015: DOCUMENTS & OFFERS TABLE
-- ============================================================================

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer', 'reservation', 'contract', 'prospectus', 'other')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'void')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'countered', 'accepted', 'rejected', 'withdrawn')),
  terms_json JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offer_events table for offer history
CREATE TABLE IF NOT EXISTS offer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'submitted', 'countered', 'accepted', 'rejected', 'withdrawn', 'note_added')),
  payload_json JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update viewings table for iCal support
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'onsite' CHECK (location_type IN ('onsite', 'virtual'));
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS virtual_link TEXT;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS ics_url TEXT;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_lead_id ON offers(lead_id);
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offer_events_offer_id ON offer_events(offer_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage offers"
  ON offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view offer events"
  ON offer_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 016: GDPR COMPLIANCE TABLE
-- ============================================================================

-- Add role field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'agent', 'editor', 'viewer'));

-- Create consents table for GDPR compliance
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  consent_text TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'export')),
  diff_json JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_consents_lead_id ON consents(lead_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consents
CREATE POLICY "Admins can view all consents"
  ON consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can insert consents"
  ON consents FOR INSERT
  WITH CHECK (true);

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Update existing RLS policies for role-based access
-- Properties: Agents see only assigned, Managers see team, Admins see all
DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
CREATE POLICY "Role-based property access"
  ON properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'manager') OR
        (profiles.role = 'agent' AND properties.agent_id = auth.uid())
      )
    )
  );

-- Leads: Agents see only assigned, Managers see team, Admins see all
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
CREATE POLICY "Role-based lead access"
  ON leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR
        (profiles.role = 'manager') OR
        (profiles.role = 'agent' AND leads.agent_id = auth.uid())
      )
    )
  );

-- ============================================================================
-- 017: AUDIT TRIGGER
-- ============================================================================

-- Create function to automatically log changes
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      jsonb_build_object('old', to_jsonb(OLD))
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      NEW.id,
      'update',
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      NEW.id,
      'create',
      jsonb_build_object('new', to_jsonb(NEW))
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for important tables
CREATE TRIGGER properties_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER leads_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER offers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON offers
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- ============================================================================
-- SAMPLE DATA (Optional - uncomment to add test data)
-- ============================================================================

-- Sample Regions
INSERT INTO regions (name_en, name_gr, slug, description_en, featured) VALUES
  ('Athens', 'Αθήνα', 'athens', 'Capital city of Greece with rich history', true),
  ('Mykonos', 'Μύκονος', 'mykonos', 'Beautiful Cycladic island', true),
  ('Santorini', 'Σαντορίνη', 'santorini', 'Iconic island with stunning sunsets', true),
  ('Thessaloniki', 'Θεσσαλονίκη', 'thessaloniki', 'Second largest city in Greece', false),
  ('Crete', 'Κρήτη', 'crete', 'Largest Greek island', false)
ON CONFLICT (slug) DO NOTHING;

-- Sample Agents
INSERT INTO agents (name_en, name_gr, email, phone, featured) VALUES
  ('Maria Papadopoulos', 'Μαρία Παπαδοπούλου', 'maria@spotlight.gr', '+30 210 123 4567', true),
  ('Nikos Dimitriou', 'Νίκος Δημητρίου', 'nikos@spotlight.gr', '+30 210 123 4568', true),
  ('Elena Georgiou', 'Έλενα Γεωργίου', 'elena@spotlight.gr', '+30 210 123 4569', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, indexes, RLS policies, triggers, and functions have been created.
-- Next steps:
-- 1. Create an admin user in Supabase Auth
-- 2. Test the application
-- 3. Add more sample data as needed
-- ============================================================================

