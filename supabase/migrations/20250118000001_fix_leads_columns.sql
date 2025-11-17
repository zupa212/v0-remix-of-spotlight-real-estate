-- Fix leads table columns to match application code
-- This migration ensures full_name, lead_source, and status columns exist
-- It handles migration from old column names (name, source, stage) to new ones

DO $$
BEGIN
  -- ============================================================================
  -- 1. FIX FULL_NAME COLUMN
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'full_name'
  ) THEN
    -- If name column exists, migrate data and rename
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'name'
    ) THEN
      -- Add full_name column
      ALTER TABLE public.leads 
      ADD COLUMN full_name TEXT;
      
      -- Copy data from name to full_name
      UPDATE public.leads 
      SET full_name = COALESCE(name, '')
      WHERE full_name IS NULL;
      
      -- Drop NOT NULL constraint temporarily if it exists
      ALTER TABLE public.leads 
      ALTER COLUMN full_name DROP NOT NULL;
      
      -- Set default for any remaining NULLs
      UPDATE public.leads 
      SET full_name = '' 
      WHERE full_name IS NULL;
      
      -- Make full_name NOT NULL
      ALTER TABLE public.leads 
      ALTER COLUMN full_name SET NOT NULL;
      
      -- Drop old name column
      ALTER TABLE public.leads 
      DROP COLUMN IF EXISTS name;
    ELSE
      -- No name column, just add full_name
      ALTER TABLE public.leads 
      ADD COLUMN full_name TEXT NOT NULL DEFAULT '';
    END IF;
  ELSE
    -- full_name exists, but might be nullable - ensure it's NOT NULL
    ALTER TABLE public.leads 
    ALTER COLUMN full_name SET DEFAULT '';
    
    UPDATE public.leads 
    SET full_name = COALESCE(full_name, '')
    WHERE full_name IS NULL;
    
    -- Try to set NOT NULL (might fail if constraint exists)
    BEGIN
      ALTER TABLE public.leads 
      ALTER COLUMN full_name SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      -- Column might already be NOT NULL, ignore
      NULL;
    END;
  END IF;
  
  -- ============================================================================
  -- 2. FIX LEAD_SOURCE COLUMN
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'lead_source'
  ) THEN
    -- If source column exists, migrate and rename
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'source'
    ) THEN
      ALTER TABLE public.leads 
      ADD COLUMN lead_source TEXT DEFAULT 'website';
      
      UPDATE public.leads 
      SET lead_source = COALESCE(source, 'website')
      WHERE lead_source IS NULL;
      
      ALTER TABLE public.leads 
      DROP COLUMN IF EXISTS source;
    ELSE
      ALTER TABLE public.leads 
      ADD COLUMN lead_source TEXT DEFAULT 'website';
    END IF;
  END IF;
  
  -- ============================================================================
  -- 3. FIX STATUS COLUMN
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'status'
  ) THEN
    -- If stage column exists, migrate and rename
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'stage'
    ) THEN
      ALTER TABLE public.leads 
      ADD COLUMN status TEXT DEFAULT 'new';
      
      UPDATE public.leads 
      SET status = COALESCE(stage, 'new')
      WHERE status IS NULL;
      
      ALTER TABLE public.leads 
      DROP COLUMN IF EXISTS stage;
    ELSE
      ALTER TABLE public.leads 
      ADD COLUMN status TEXT DEFAULT 'new';
    END IF;
  END IF;
  
  -- ============================================================================
  -- 4. ENSURE EMAIL COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN email TEXT NOT NULL DEFAULT '';
  ELSE
    -- Ensure email has default
    ALTER TABLE public.leads 
    ALTER COLUMN email SET DEFAULT '';
    
    UPDATE public.leads 
    SET email = COALESCE(email, '')
    WHERE email IS NULL;
    
    BEGIN
      ALTER TABLE public.leads 
      ALTER COLUMN email SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  
  -- ============================================================================
  -- 5. ENSURE PHONE COLUMN EXISTS
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN phone TEXT;
  END IF;
  
  -- ============================================================================
  -- 6. ENSURE PROPERTY_ID AND AGENT_ID COLUMNS EXIST
  -- ============================================================================
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'property_id'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'agent_id'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_leads_full_name ON public.leads(full_name);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_property ON public.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads(agent_id);

