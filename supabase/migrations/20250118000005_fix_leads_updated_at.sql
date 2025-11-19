-- Fix leads table: Ensure updated_at and created_at columns exist
-- This migration ensures the leads table has all required timestamp columns

DO $$
BEGIN
  -- ============================================================================
  -- 1. ENSURE CREATED_AT COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.leads
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  ELSE
    -- Ensure it has a default
    ALTER TABLE public.leads
    ALTER COLUMN created_at SET DEFAULT NOW();
    
    -- Set default for any NULLs
    UPDATE public.leads
    SET created_at = NOW()
    WHERE created_at IS NULL;
  END IF;

  -- ============================================================================
  -- 2. ENSURE UPDATED_AT COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.leads
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ELSE
    -- Ensure it has a default
    ALTER TABLE public.leads
    ALTER COLUMN updated_at SET DEFAULT NOW();
    
    -- Set default for any NULLs
    UPDATE public.leads
    SET updated_at = COALESCE(created_at, NOW())
    WHERE updated_at IS NULL;
  END IF;
END $$;

-- Create index on updated_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leads_updated_at();

