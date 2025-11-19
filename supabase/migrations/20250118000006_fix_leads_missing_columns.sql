-- Fix leads table: Ensure lead_type, priority, and message columns exist
-- This migration ensures all columns used by the inquiry form exist

DO $$
BEGIN
  -- ============================================================================
  -- 1. ENSURE LEAD_TYPE COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'lead_type'
  ) THEN
    ALTER TABLE public.leads
    ADD COLUMN lead_type TEXT;
    
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND constraint_name LIKE '%lead_type%'
    ) THEN
      ALTER TABLE public.leads
      ADD CONSTRAINT leads_lead_type_check 
      CHECK (lead_type IS NULL OR lead_type IN ('property_inquiry', 'viewing_request', 'general_inquiry', 'contact_form'));
    END IF;
  END IF;

  -- ============================================================================
  -- 2. ENSURE PRIORITY COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.leads
    ADD COLUMN priority TEXT DEFAULT 'medium';
    
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage
      WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND constraint_name LIKE '%priority%'
    ) THEN
      ALTER TABLE public.leads
      ADD CONSTRAINT leads_priority_check 
      CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high'));
    END IF;
  ELSE
    -- Ensure it has a default
    ALTER TABLE public.leads
    ALTER COLUMN priority SET DEFAULT 'medium';
  END IF;

  -- ============================================================================
  -- 3. ENSURE MESSAGE COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'message'
  ) THEN
    ALTER TABLE public.leads
    ADD COLUMN message TEXT;
  END IF;
END $$;

-- Create index on lead_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON public.leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);

