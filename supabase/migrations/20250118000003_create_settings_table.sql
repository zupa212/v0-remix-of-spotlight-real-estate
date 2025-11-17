-- Create settings table to store admin panel configuration
-- This table stores logo URL, company name, and other admin settings

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branding
  logo_url TEXT,
  company_name TEXT DEFAULT 'Spotlight Estate Group',
  company_email TEXT DEFAULT 'admin@spotlight.gr',
  
  -- Theme
  primary_color TEXT DEFAULT '#0EA5E9',
  accent_color TEXT DEFAULT '#F59E0B',
  
  -- Scoring
  hot_threshold INTEGER DEFAULT 75,
  warm_threshold INTEGER DEFAULT 50,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one settings record exists
  CONSTRAINT single_settings CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Insert default settings record
INSERT INTO public.settings (id, logo_url, company_name, company_email, primary_color, accent_color, hot_threshold, warm_threshold)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  NULL,
  'Spotlight Estate Group',
  'admin@spotlight.gr',
  '#0EA5E9',
  '#F59E0B',
  75,
  50
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view settings
CREATE POLICY "Authenticated users can view settings"
ON public.settings FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update settings"
ON public.settings FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert settings"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_id ON public.settings(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

